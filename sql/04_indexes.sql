-- Index cho bảng profiles
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_tiktok ON public.profiles(tiktok_username);

-- Index cho bảng videos
CREATE INDEX idx_videos_user_id ON public.videos(user_id);
CREATE INDEX idx_videos_category ON public.videos(category);
CREATE INDEX idx_videos_user_active ON public.videos(user_id, is_active);

-- Index cho bảng campaigns
CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_user_status ON public.campaigns(user_id, status);
CREATE INDEX idx_campaigns_status_active ON public.campaigns(status) WHERE status = 'active';

-- Index cho bảng actions
CREATE INDEX idx_actions_user_id ON public.actions(user_id);
CREATE INDEX idx_actions_campaign_id ON public.actions(campaign_id);
CREATE INDEX idx_actions_user_created ON public.actions(user_id, created_at DESC);
CREATE INDEX idx_actions_campaign_created ON public.actions(campaign_id, created_at DESC);

-- Index cho bảng transactions
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);

-- Index cho bảng notifications
CREATE INDEX idx_notifications_user_id_read ON public.notifications(user_id, is_read);