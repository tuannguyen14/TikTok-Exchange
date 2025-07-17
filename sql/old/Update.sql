-- Bảng follow campaigns (riêng biệt với video campaigns)
CREATE TABLE public.follow_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_tiktok_username VARCHAR(100) NOT NULL,
    credits_per_follow INTEGER NOT NULL,
    target_count INTEGER NOT NULL,
    current_count INTEGER DEFAULT 0,
    total_credits INTEGER NOT NULL,
    remaining_credits INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Đảm bảo không tự follow mình
    CONSTRAINT no_self_follow CHECK (
        user_id != (SELECT id FROM public.profiles WHERE tiktok_username = target_tiktok_username)
    )
);

-- Bảng follow actions (để track ai đã follow ai)
CREATE TABLE public.follow_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    follow_campaign_id UUID REFERENCES public.follow_campaigns(id) ON DELETE CASCADE,
    target_tiktok_username VARCHAR(100) NOT NULL,
    credits_earned INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    proof_data JSONB, -- Screenshot hoặc proof khác
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Mỗi user chỉ có thể follow 1 lần per campaign
    UNIQUE(user_id, follow_campaign_id)
);

-- Cập nhật bảng campaigns để video_id có thể null (cho follow campaigns)
ALTER TABLE public.campaigns 
ALTER COLUMN video_id DROP NOT NULL;

-- Thêm constraint để đảm bảo logic
ALTER TABLE public.campaigns 
ADD CONSTRAINT video_or_follow_required 
CHECK (
    (interaction_type IN ('view', 'like', 'comment') AND video_id IS NOT NULL) OR
    (interaction_type = 'follow' AND video_id IS NULL)
);

-- Thêm trường target_username cho follow campaigns
ALTER TABLE public.campaigns 
ADD COLUMN target_username VARCHAR(100);

-- Index cho performance
CREATE INDEX idx_follow_campaigns_user_id ON public.follow_campaigns(user_id);
CREATE INDEX idx_follow_campaigns_status ON public.follow_campaigns(status);
CREATE INDEX idx_follow_campaigns_target ON public.follow_campaigns(target_tiktok_username);
CREATE INDEX idx_follow_actions_user_id ON public.follow_actions(user_id);
CREATE INDEX idx_follow_actions_campaign_id ON public.follow_actions(follow_campaign_id);

-- Function tạo follow campaign
CREATE OR REPLACE FUNCTION public.create_follow_campaign(
    p_user_id UUID,
    p_target_username VARCHAR(100),
    p_target_count INTEGER,
    p_credits_per_follow INTEGER,
    p_total_credits INTEGER
)
RETURNS UUID AS $$
DECLARE
    v_campaign_id UUID;
    current_balance INTEGER;
    user_username VARCHAR(100);
BEGIN
    -- Lấy username của user tạo campaign
    SELECT tiktok_username INTO user_username 
    FROM public.profiles 
    WHERE id = p_user_id;
    
    -- Kiểm tra không tự follow
    IF user_username = p_target_username THEN
        RAISE EXCEPTION 'Cannot create follow campaign for yourself';
    END IF;
    
    -- Kiểm tra credit
    SELECT credits INTO current_balance FROM public.profiles WHERE id = p_user_id;
    IF current_balance < p_total_credits THEN
        RAISE EXCEPTION 'Insufficient credits. Need %, have %', p_total_credits, current_balance;
    END IF;

    -- Tạo follow campaign
    INSERT INTO public.follow_campaigns (
        user_id, target_tiktok_username, credits_per_follow,
        target_count, current_count, total_credits, remaining_credits, status
    ) VALUES (
        p_user_id, p_target_username, p_credits_per_follow,
        p_target_count, 0, p_total_credits, p_total_credits, 'active'
    ) RETURNING id INTO v_campaign_id;

    -- Trừ credit
    PERFORM public.update_user_credits(
        p_user_id,
        -p_total_credits,
        'spend',
        'Follow campaign creation for @' || p_target_username,
        v_campaign_id,
        'follow_campaign'
    );

    RETURN v_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function xử lý follow action
CREATE OR REPLACE FUNCTION public.process_follow_action(
    p_user_id UUID,
    p_follow_campaign_id UUID,
    p_proof_data JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_campaign RECORD;
    v_action_id UUID;
    user_username VARCHAR(100);
BEGIN
    -- Lấy username của user thực hiện
    SELECT tiktok_username INTO user_username 
    FROM public.profiles 
    WHERE id = p_user_id;
    
    -- Lấy thông tin follow campaign
    SELECT * INTO v_campaign FROM public.follow_campaigns 
    WHERE id = p_follow_campaign_id AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Follow campaign not found');
    END IF;
    
    -- Kiểm tra không tự follow
    IF user_username = v_campaign.target_tiktok_username THEN
        RETURN jsonb_build_object('success', false, 'message', 'Cannot follow yourself');
    END IF;

    -- Kiểm tra trùng lặp
    IF EXISTS (
        SELECT 1 FROM public.follow_actions
        WHERE user_id = p_user_id AND follow_campaign_id = p_follow_campaign_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Already followed this user');
    END IF;

    -- Thêm follow action
    INSERT INTO public.follow_actions (
        user_id, follow_campaign_id, target_tiktok_username, 
        credits_earned, proof_data
    ) VALUES (
        p_user_id, p_follow_campaign_id, v_campaign.target_tiktok_username,
        v_campaign.credits_per_follow, p_proof_data
    ) RETURNING id INTO v_action_id;

    -- Cập nhật follow campaign
    UPDATE public.follow_campaigns
    SET 
        current_count = current_count + 1,
        remaining_credits = remaining_credits - v_campaign.credits_per_follow,
        status = CASE 
            WHEN current_count + 1 >= target_count THEN 'completed'
            WHEN remaining_credits - v_campaign.credits_per_follow <= 0 THEN 'completed'
            ELSE status
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_follow_campaign_id;

    -- Cộng credit cho user
    PERFORM public.update_user_credits(
        p_user_id,
        v_campaign.credits_per_follow,
        'earn',
        'Earned from following @' || v_campaign.target_tiktok_username,
        v_action_id,
        'follow_action'
    );

    -- Lưu vào user_follows để track relationship lâu dài
    INSERT INTO public.user_follows (follower_id, following_tiktok_username)
    VALUES (p_user_id, v_campaign.target_tiktok_username)
    ON CONFLICT DO NOTHING;

    RETURN jsonb_build_object(
        'success', true, 
        'credits_earned', v_campaign.credits_per_follow,
        'target_username', v_campaign.target_tiktok_username
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function lấy follow campaigns cho Exchange Hub
CREATE OR REPLACE FUNCTION public.get_follow_campaigns(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    campaign_id UUID,
    target_username VARCHAR(100),
    credits_per_follow INTEGER,
    current_count INTEGER,
    target_count INTEGER,
    creator_username VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fc.id as campaign_id,
        fc.target_tiktok_username as target_username,
        fc.credits_per_follow,
        fc.current_count,
        fc.target_count,
        p.tiktok_username as creator_username
    FROM public.follow_campaigns fc
    JOIN public.profiles p ON fc.user_id = p.id
    WHERE fc.status = 'active'
    AND fc.user_id != p_user_id -- không phải campaign của mình
    -- Chưa follow user này
    AND NOT EXISTS (
        SELECT 1 FROM public.follow_actions fa
        WHERE fa.user_id = p_user_id 
        AND fa.follow_campaign_id = fc.id
    )
    -- Chưa follow TikTok user này trước đó
    AND NOT EXISTS (
        SELECT 1 FROM public.user_follows uf
        WHERE uf.follower_id = p_user_id 
        AND uf.following_tiktok_username = fc.target_tiktok_username
    )
    ORDER BY 
        -- Ưu tiên campaign ít follow
        fc.current_count::FLOAT / NULLIF(fc.target_count, 0) ASC,
        fc.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View để xem tất cả campaigns (video + follow)
CREATE OR REPLACE VIEW public.all_campaigns AS
SELECT 
    'video' as campaign_type,
    c.id,
    c.user_id,
    c.interaction_type,
    c.credits_per_action as credits_per_action,
    c.target_count,
    c.current_count,
    c.total_credits,
    c.remaining_credits,
    c.status,
    c.created_at,
    c.updated_at,
    v.title as video_title,
    v.video_url,
    NULL as target_username,
    p.tiktok_username as creator_username
FROM public.campaigns c
JOIN public.videos v ON c.video_id = v.id
JOIN public.profiles p ON c.user_id = p.id

UNION ALL

SELECT 
    'follow' as campaign_type,
    fc.id,
    fc.user_id,
    'follow' as interaction_type,
    fc.credits_per_follow as credits_per_action,
    fc.target_count,
    fc.current_count,
    fc.total_credits,
    fc.remaining_credits,
    fc.status,
    fc.created_at,
    fc.updated_at,
    NULL as video_title,
    NULL as video_url,
    fc.target_tiktok_username as target_username,
    p.tiktok_username as creator_username
FROM public.follow_campaigns fc
JOIN public.profiles p ON fc.user_id = p.id;