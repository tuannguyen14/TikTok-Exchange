-- Xử lý đăng ký người dùng mới
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cập nhật credit người dùng
CREATE OR REPLACE FUNCTION public.update_user_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_type VARCHAR(20),
    p_description TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
BEGIN
    SELECT credits INTO current_balance FROM public.profiles WHERE id = p_user_id;
    new_balance := current_balance + p_amount;
    
    UPDATE public.profiles
    SET 
        credits = new_balance,
        total_earned = CASE WHEN p_amount > 0 THEN total_earned + p_amount ELSE total_earned END,
        total_spent = CASE WHEN p_amount < 0 THEN total_spent + ABS(p_amount) ELSE total_spent END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_user_id;
    
    INSERT INTO public.transactions (
        user_id, type, amount, balance_after, description, 
        reference_id, reference_type
    ) VALUES (
        p_user_id, p_type, p_amount, new_balance, p_description,
        p_reference_id, p_reference_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Xử lý hành động tương tác
CREATE OR REPLACE FUNCTION public.process_action(
    p_user_id UUID,
    p_campaign_id UUID,
    p_action_type VARCHAR(20),
    p_proof_data JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_campaign RECORD;
    v_action_id UUID;
BEGIN
    -- Kiểm tra giới hạn
    IF NOT public.check_rate_limit(p_user_id, p_action_type, 20, '1 hour') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Rate limit exceeded');
    END IF;

    -- Lấy thông tin chiến dịch
    SELECT * INTO v_campaign FROM public.campaigns 
    WHERE id = p_campaign_id AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Campaign not found');
    END IF;

    -- Kiểm tra trùng lặp
    IF EXISTS (
        SELECT 1 FROM public.actions
        WHERE user_id = p_user_id AND campaign_id = p_campaign_id AND action_type = p_action_type
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Action already performed');
    END IF;

    -- Thêm hành động
    INSERT INTO public.actions (
        user_id, campaign_id, video_id, action_type, 
        credits_earned, proof_data
    ) VALUES (
        p_user_id, p_campaign_id, v_campaign.video_id, p_action_type,
        v_campaign.credits_per_action, p_proof_data
    ) RETURNING id INTO v_action_id;

    -- Cập nhật chiến dịch
    UPDATE public.campaigns
    SET 
        current_count = current_count + 1,
        remaining_credits = remaining_credits - v_campaign.credits_per_action,
        status = CASE 
            WHEN current_count + 1 >= target_count THEN 'completed'
            WHEN remaining_credits - v_campaign.credits_per_action <= 0 THEN 'completed'
            ELSE status
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_campaign_id;

    -- Cộng credit
    PERFORM public.update_user_credits(
        p_user_id,
        v_campaign.credits_per_action,
        'earn',
        'Earned from ' || p_action_type || ' action',
        v_action_id,
        'action'
    );

    RETURN jsonb_build_object('success', true, 'credits_earned', v_campaign.credits_per_action);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tạo chiến dịch
CREATE OR REPLACE FUNCTION public.create_campaign_transaction(
    p_user_id UUID,
    p_video_url TEXT,
    p_tiktok_video_id VARCHAR(100),
    p_interaction_type VARCHAR(20),
    p_target_count INTEGER,
    p_credits_per_action INTEGER,
    p_total_credits INTEGER,
    p_video_title TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_category VARCHAR(50) DEFAULT 'general'
)
RETURNS UUID AS $$
DECLARE
    v_video_id UUID;
    v_campaign_id UUID;
    current_balance INTEGER;
BEGIN
    -- Kiểm tra credit
    SELECT credits INTO current_balance FROM public.profiles WHERE id = p_user_id;
    IF current_balance < p_total_credits THEN
        RAISE EXCEPTION 'Insufficient credits. Need %, have %', p_total_credits, current_balance;
    END IF;

    -- Tạo/update video
    INSERT INTO public.videos (
        user_id, tiktok_video_id, video_url, title,
        description, category, is_active
    ) VALUES (
        p_user_id, p_tiktok_video_id, p_video_url, p_video_title,
        p_description, p_category, TRUE
    )
    ON CONFLICT (tiktok_video_id) 
    DO UPDATE SET 
        title = COALESCE(EXCLUDED.title, videos.title),
        description = COALESCE(EXCLUDED.description, videos.description),
        category = COALESCE(EXCLUDED.category, videos.category),
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_video_id;

    -- Tạo chiến dịch
    INSERT INTO public.campaigns (
        user_id, video_id, interaction_type, credits_per_action,
        target_count, current_count, total_credits, remaining_credits, status
    ) VALUES (
        p_user_id, v_video_id, p_interaction_type, p_credits_per_action,
        p_target_count, 0, p_total_credits, p_total_credits, 'active'
    ) RETURNING id INTO v_campaign_id;

    -- Trừ credit
    PERFORM public.update_user_credits(
        p_user_id,
        -p_total_credits,
        'spend',
        'Campaign creation: ' || p_interaction_type || ' for video ' || COALESCE(p_video_title, p_tiktok_video_id),
        v_campaign_id,
        'campaign'
    );

    RETURN v_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hủy chiến dịch
CREATE OR REPLACE FUNCTION public.delete_campaign_with_refund(
    p_campaign_id UUID,
    p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_campaign RECORD;
BEGIN
    -- Lấy thông tin chiến dịch
    SELECT * INTO v_campaign FROM public.campaigns
    WHERE id = p_campaign_id AND user_id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Campaign not found or unauthorized';
    END IF;
    
    -- Kiểm tra hành động đã thực hiện
    IF v_campaign.current_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete campaign with existing actions';
    END IF;
    
    -- Hoàn tiền nếu còn
    IF v_campaign.remaining_credits > 0 THEN
        PERFORM public.update_user_credits(
            p_user_id,
            v_campaign.remaining_credits,
            'earn',
            'Refund from deleted campaign',
            p_campaign_id,
            'refund'
        );
    END IF;
    
    -- Xóa chiến dịch
    DELETE FROM public.campaigns WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kiểm tra giới hạn hành động
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_user_id UUID,
    p_action_type VARCHAR(20),
    p_limit INTEGER DEFAULT 10,
    p_time_window INTERVAL DEFAULT '1 hour'
)
RETURNS BOOLEAN AS $$
DECLARE
    action_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO action_count
    FROM public.actions
    WHERE user_id = p_user_id 
    AND action_type = p_action_type
    AND created_at > CURRENT_TIMESTAMP - p_time_window;
    
    RETURN action_count < p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Thống kê chiến dịch
-- CREATE OR REPLACE FUNCTION public.get_campaign_analytics(
--     p_user_id UUID,
--     p_days INTEGER DEFAULT 30
-- )
-- RETURNS JSON AS $$
-- BEGIN
--     RETURN (
--         SELECT json_build_object(
--             'total_campaigns', COUNT(*),
--             'active_campaigns', SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END),
--             'completed_campaigns', SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END),
--             'total_credits_spent', COALESCE(SUM(total_credits - remaining_credits), 0),
--             'daily_stats', (
--                 SELECT json_agg(json_build_object(
--                     'date', date_trunc('day', created_at),
--                     'actions', COUNT(*),
--                     'credits', SUM(credits_earned)
--                 )
--                 FROM public.actions
--                 WHERE created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
--                 GROUP BY date_trunc('day', created_at)
--         )
--         FROM public.campaigns
--         WHERE user_id = p_user_id
--     );
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Thống kê hành động
-- CREATE OR REPLACE FUNCTION public.get_user_action_stats(
--     p_user_id UUID,
--     p_days INTEGER DEFAULT 30
-- )
-- RETURNS JSON AS $$
-- BEGIN
--     RETURN (
--         SELECT json_build_object(
--             'total_actions', COUNT(*),
--             'total_credits_earned', COALESCE(SUM(credits_earned), 0),
--             'action_breakdown', (
--                 SELECT json_object_agg(
--                     action_type, json_build_object(
--                         'count', COUNT(*),
--                         'credits', SUM(credits_earned)
--                     )
--                 )
--                 FROM public.actions
--                 WHERE user_id = p_user_id
--                 GROUP BY action_type
--             ),
--             'recent_actions', (
--                 SELECT json_agg(json_build_object(
--                     'id', id,
--                     'action_type', action_type,
--                     'credits_earned', credits_earned,
--                     'created_at', created_at
--                 ))
--                 FROM public.actions
--                 WHERE user_id = p_user_id
--                 ORDER BY created_at DESC
--                 LIMIT 10
--             )
--         )
--         FROM public.actions
--         WHERE user_id = p_user_id
--     );
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;