-- TikGrow Supabase Database Schema

-- Enable RLS
-- ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    tiktok_username VARCHAR(10) UNIQUE,
    credits INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Videos table
CREATE TABLE public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tiktok_video_id VARCHAR(100) UNIQUE NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title TEXT,
    description TEXT,
    category VARCHAR(50),
    tiktok_stats JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table (người dùng tạo để nhận tương tác)
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL, -- 'like', 'comment', 'follow', 'view'
    credits_per_action INTEGER NOT NULL,
    target_count INTEGER NOT NULL,
    current_count INTEGER DEFAULT 0,
    total_credits INTEGER NOT NULL,
    remaining_credits INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'completed'
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Actions table (người dùng thực hiện tương tác)
CREATE TABLE public.actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL,
    credits_earned INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    proof_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate actions
    UNIQUE(user_id, campaign_id, action_type)
);

-- Credit transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'earn', 'spend', 'bonus'
    amount INTEGER NOT NULL, -- positive for earn, negative for spend
    balance_after INTEGER NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update credits
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
    -- Get current balance
    SELECT credits INTO current_balance
    FROM public.profiles
    WHERE id = p_user_id;
    
    -- Calculate new balance
    new_balance := current_balance + p_amount;
    
    -- Update user credits
    UPDATE public.profiles
    SET 
        credits = new_balance,
        total_earned = CASE WHEN p_amount > 0 THEN total_earned + p_amount ELSE total_earned END,
        total_spent = CASE WHEN p_amount < 0 THEN total_spent + ABS(p_amount) ELSE total_spent END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_user_id;
    
    -- Insert transaction record
    INSERT INTO public.transactions (user_id, type, amount, balance_after, description, reference_id, reference_type)
    VALUES (p_user_id, p_type, p_amount, new_balance, p_description, p_reference_id, p_reference_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process action and update credits
CREATE OR REPLACE FUNCTION public.process_action(
    p_user_id UUID,
    p_campaign_id UUID,
    p_action_type VARCHAR(20),
    p_proof_data JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_campaign RECORD;
    v_credits_earned INTEGER;
    v_action_id UUID;
    v_result JSONB;
BEGIN
    -- Get campaign details
    SELECT * INTO v_campaign
    FROM public.campaigns
    WHERE id = p_campaign_id AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Campaign not found or inactive');
    END IF;
    
    -- Check if user already performed this action
    IF EXISTS (
        SELECT 1 FROM public.actions
        WHERE user_id = p_user_id AND campaign_id = p_campaign_id AND action_type = p_action_type
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Action already performed');
    END IF;
    
    -- Check if campaign has enough credits
    IF v_campaign.remaining_credits < v_campaign.credits_per_action THEN
        RETURN jsonb_build_object('success', false, 'message', 'Campaign has insufficient credits');
    END IF;
    
    -- Check if user is not the campaign owner
    IF v_campaign.user_id = p_user_id THEN
        RETURN jsonb_build_object('success', false, 'message', 'Cannot perform action on own campaign');
    END IF;
    
    -- Insert action record
    INSERT INTO public.actions (user_id, campaign_id, video_id, action_type, credits_earned, proof_data)
    VALUES (p_user_id, p_campaign_id, v_campaign.video_id, p_action_type, v_campaign.credits_per_action, p_proof_data)
    RETURNING id INTO v_action_id;
    
    -- Update campaign
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
    
    -- Add credits to user
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

-- Views for easy querying
CREATE VIEW public.user_stats AS
SELECT 
    p.*,
    COALESCE(v.video_count, 0) as total_videos,
    COALESCE(c.campaign_count, 0) as total_campaigns,
    COALESCE(a.action_count, 0) as total_actions
FROM public.profiles p
LEFT JOIN (
    SELECT user_id, COUNT(*) as video_count
    FROM public.videos
    GROUP BY user_id
) v ON p.id = v.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as campaign_count
    FROM public.campaigns
    GROUP BY user_id
) c ON p.id = c.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as action_count
    FROM public.actions
    GROUP BY user_id
) a ON p.id = a.user_id;

CREATE VIEW public.active_campaigns AS
SELECT 
    c.*,
    p.tiktok_username as creator_tiktok,
    v.title as video_title,
    v.video_url,
    v.thumbnail_url,
    v.category
FROM public.campaigns c
JOIN public.profiles p ON c.user_id = p.id
JOIN public.videos v ON c.video_id = v.id
WHERE c.status = 'active'
AND (c.expires_at IS NULL OR c.expires_at > CURRENT_TIMESTAMP)
ORDER BY c.created_at DESC;



-- Bổ sung trigger khi tạo campaign
CREATE OR REPLACE FUNCTION public.deduct_campaign_credits()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.update_user_credits(
    NEW.user_id,
    -NEW.total_credits,
    'spend',
    'Campaign creation'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_campaign_created
AFTER INSERT ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION public.deduct_campaign_credits();

-- Bổ sung bảng tham chiếu credit values (tuân thủ 1/2/3/5 credits)
CREATE TABLE public.action_credit_values (
  action_type VARCHAR(20) PRIMARY KEY,
  credit_value INTEGER NOT NULL
);

INSERT INTO public.action_credit_values VALUES 
('view', 1), ('like', 2), ('comment', 3), ('follow', 5);


-- Additional SQL functions for campaign management

-- Function to create campaign with transaction
CREATE OR REPLACE FUNCTION public.create_campaign_transaction(
    p_user_id UUID,
    p_video_url TEXT,
    p_tiktok_video_id VARCHAR(100),
    p_video_title TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_category VARCHAR(50) DEFAULT 'general',
    p_interaction_type VARCHAR(20),
    p_target_count INTEGER,
    p_credits_per_action INTEGER,
    p_total_credits INTEGER
)
RETURNS UUID AS $$
DECLARE
    v_video_id UUID;
    v_campaign_id UUID;
    current_balance INTEGER;
BEGIN
    -- Check user credits
    SELECT credits INTO current_balance
    FROM public.profiles
    WHERE id = p_user_id;
    
    IF current_balance < p_total_credits THEN
        RAISE EXCEPTION 'Insufficient credits. Need %, have %', p_total_credits, current_balance;
    END IF;
    
    -- Create or get existing video
    INSERT INTO public.videos (
        user_id,
        tiktok_video_id,
        video_url,
        title,
        description,
        category,
        is_active
    ) VALUES (
        p_user_id,
        p_tiktok_video_id,
        p_video_url,
        p_video_title,
        p_description,
        p_category,
        TRUE
    )
    ON CONFLICT (tiktok_video_id) 
    DO UPDATE SET 
        title = COALESCE(EXCLUDED.title, videos.title),
        description = COALESCE(EXCLUDED.description, videos.description),
        category = COALESCE(EXCLUDED.category, videos.category),
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_video_id;
    
    -- Create campaign
    INSERT INTO public.campaigns (
        user_id,
        video_id,
        interaction_type,
        credits_per_action,
        target_count,
        current_count,
        total_credits,
        remaining_credits,
        status
    ) VALUES (
        p_user_id,
        v_video_id,
        p_interaction_type,
        p_credits_per_action,
        p_target_count,
        0,
        p_total_credits,
        p_total_credits,
        'active'
    )
    RETURNING id INTO v_campaign_id;
    
    -- Deduct credits from user
    PERFORM public.update_user_credits(
        p_user_id,
        -p_total_credits,
        'spend',
        'Campaign creation: ' || p_interaction_type || ' for video ' || p_video_title,
        v_campaign_id,
        'campaign'
    );
    
    RETURN v_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete campaign with refund
CREATE OR REPLACE FUNCTION public.delete_campaign_with_refund(
    p_campaign_id UUID,
    p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_campaign RECORD;
BEGIN
    -- Get campaign details
    SELECT * INTO v_campaign
    FROM public.campaigns
    WHERE id = p_campaign_id AND user_id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Campaign not found or unauthorized';
    END IF;
    
    -- Check if campaign has received actions
    IF v_campaign.current_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete campaign that has received actions';
    END IF;
    
    -- Refund remaining credits
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
    
    -- Delete campaign
    DELETE FROM public.campaigns WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get campaign analytics
CREATE OR REPLACE FUNCTION public.get_campaign_analytics(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_campaigns', (
            SELECT COUNT(*) FROM public.campaigns WHERE user_id = p_user_id
        ),
        'active_campaigns', (
            SELECT COUNT(*) FROM public.campaigns 
            WHERE user_id = p_user_id AND status = 'active'
        ),
        'completed_campaigns', (
            SELECT COUNT(*) FROM public.campaigns 
            WHERE user_id = p_user_id AND status = 'completed'
        ),
        'total_credits_spent', (
            SELECT COALESCE(SUM(total_credits - remaining_credits), 0) 
            FROM public.campaigns WHERE user_id = p_user_id
        ),
        'total_actions_received', (
            SELECT COALESCE(SUM(current_count), 0) 
            FROM public.campaigns WHERE user_id = p_user_id
        ),
        'daily_stats', (
            SELECT json_agg(json_build_object(
                'date', date_trunc('day', created_at),
                'actions', COUNT(*),
                'credits', SUM(credits_earned)
            ))
            FROM public.actions a
            JOIN public.campaigns c ON a.campaign_id = c.id
            WHERE c.user_id = p_user_id 
            AND a.created_at >= CURRENT_DATE - INTERVAL '%s days'
            GROUP BY date_trunc('day', created_at)
            ORDER BY date_trunc('day', created_at)
        ),
        'interaction_breakdown', (
            SELECT json_object_agg(
                interaction_type,
                json_build_object(
                    'campaigns', COUNT(*),
                    'total_actions', SUM(current_count),
                    'credits_spent', SUM(total_credits - remaining_credits)
                )
            )
            FROM public.campaigns 
            WHERE user_id = p_user_id
            GROUP BY interaction_type
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user action statistics
CREATE OR REPLACE FUNCTION public.get_user_action_stats(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_actions', (
            SELECT COUNT(*) FROM public.actions WHERE user_id = p_user_id
        ),
        'total_credits_earned', (
            SELECT COALESCE(SUM(credits_earned), 0) 
            FROM public.actions WHERE user_id = p_user_id
        ),
        'action_breakdown', (
            SELECT json_object_agg(
                action_type,
                json_build_object(
                    'count', COUNT(*),
                    'credits', SUM(credits_earned)
                )
            )
            FROM public.actions 
            WHERE user_id = p_user_id
            GROUP BY action_type
        ),
        'daily_earnings', (
            SELECT json_agg(json_build_object(
                'date', date_trunc('day', created_at),
                'actions', COUNT(*),
                'credits', SUM(credits_earned)
            ))
            FROM public.actions
            WHERE user_id = p_user_id 
            AND created_at >= CURRENT_DATE - INTERVAL '%s days'
            GROUP BY date_trunc('day', created_at)
            ORDER BY date_trunc('day', created_at)
        ),
        'recent_actions', (
            SELECT json_agg(json_build_object(
                'id', a.id,
                'action_type', a.action_type,
                'credits_earned', a.credits_earned,
                'created_at', a.created_at,
                'video_title', v.title
            ))
            FROM public.actions a
            JOIN public.videos v ON a.video_id = v.id
            WHERE a.user_id = p_user_id
            ORDER BY a.created_at DESC
            LIMIT 10
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated trigger function for profile creation with email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for campaign leaderboard
CREATE OR REPLACE VIEW public.campaign_leaderboard AS
SELECT 
    p.email,
    p.tiktok_username,
    COUNT(c.id) as total_campaigns,
    SUM(c.current_count) as total_actions_received,
    SUM(c.total_credits - c.remaining_credits) as total_credits_spent,
    AVG(c.current_count::float / c.target_count * 100) as avg_completion_rate
FROM public.profiles p
LEFT JOIN public.campaigns c ON p.id = c.user_id
WHERE p.status = 'active'
GROUP BY p.id, p.email, p.tiktok_username
ORDER BY total_actions_received DESC, total_campaigns DESC;

-- View for top performers (users who do the most actions)
CREATE OR REPLACE VIEW public.action_leaderboard AS
SELECT 
    p.email,
    p.tiktok_username,
    COUNT(a.id) as total_actions,
    SUM(a.credits_earned) as total_credits_earned,
    COUNT(DISTINCT a.campaign_id) as campaigns_helped,
    AVG(a.credits_earned) as avg_credits_per_action
FROM public.profiles p
LEFT JOIN public.actions a ON p.id = a.user_id
WHERE p.status = 'active'
GROUP BY p.id, p.email, p.tiktok_username
ORDER BY total_actions DESC, total_credits_earned DESC;

-- Index optimizations for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_status ON public.campaigns(user_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_status_active ON public.campaigns(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_actions_user_created ON public.actions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_actions_campaign_created ON public.actions(campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_user_active ON public.videos(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_tiktok ON public.profiles(tiktok_username);

-- Function to check rate limiting (prevent spam)
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

-- Updated process_action function with rate limiting
CREATE OR REPLACE FUNCTION public.process_action(
    p_user_id UUID,
    p_campaign_id UUID,
    p_action_type VARCHAR(20),
    p_proof_data JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_campaign RECORD;
    v_credits_earned INTEGER;
    v_action_id UUID;
    v_result JSONB;
BEGIN
    -- Check rate limiting
    IF NOT public.check_rate_limit(p_user_id, p_action_type, 20, '1 hour') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Rate limit exceeded. Please wait before performing more actions.');
    END IF;
    
    -- Get campaign details
    SELECT * INTO v_campaign
    FROM public.campaigns
    WHERE id = p_campaign_id AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Campaign not found or inactive');
    END IF;
    
    -- Check if campaign matches action type
    IF v_campaign.interaction_type != p_action_type THEN
        RETURN jsonb_build_object('success', false, 'message', 'Action type does not match campaign requirement');
    END IF;
    
    -- Check if user already performed this action
    IF EXISTS (
        SELECT 1 FROM public.actions
        WHERE user_id = p_user_id AND campaign_id = p_campaign_id AND action_type = p_action_type
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Action already performed');
    END IF;
    
    -- Check if campaign has enough credits
    IF v_campaign.remaining_credits < v_campaign.credits_per_action THEN
        RETURN jsonb_build_object('success', false, 'message', 'Campaign has insufficient credits');
    END IF;
    
    -- Check if user is not the campaign owner
    IF v_campaign.user_id = p_user_id THEN
        RETURN jsonb_build_object('success', false, 'message', 'Cannot perform action on own campaign');
    END IF;
    
    -- Insert action record
    INSERT INTO public.actions (user_id, campaign_id, video_id, action_type, credits_earned, proof_data)
    VALUES (p_user_id, p_campaign_id, v_campaign.video_id, p_action_type, v_campaign.credits_per_action, p_proof_data)
    RETURNING id INTO v_action_id;
    
    -- Update campaign
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
    
    -- Add credits to user
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