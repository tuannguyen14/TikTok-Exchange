-- Bảng người dùng
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    tiktok_username VARCHAR(100) UNIQUE,
    credits INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng video
CREATE TABLE public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tiktok_video_id VARCHAR(100) UNIQUE NOT NULL,
    video_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    category VARCHAR(50),
    tiktok_stats JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng chiến dịch
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL,
    credits_per_action INTEGER NOT NULL,
    target_count INTEGER NOT NULL,
    current_count INTEGER DEFAULT 0,
    total_credits INTEGER NOT NULL,
    remaining_credits INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng hành động
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
    UNIQUE(user_id, campaign_id, action_type)
);

-- Bảng giao dịch
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng thông báo
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

-- Bảng tham chiếu giá trị credit
CREATE TABLE public.action_credit_values (
    action_type VARCHAR(20) PRIMARY KEY,
    credit_value INTEGER NOT NULL
);

-- Dữ liệu mẫu
INSERT INTO public.action_credit_values VALUES 
('view', 1), ('like', 2), ('comment', 3), ('follow', 5);