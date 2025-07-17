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

-- Indexes cho saved_videos
CREATE INDEX idx_saved_videos_user ON public.saved_videos(user_id);
CREATE INDEX idx_saved_videos_created ON public.saved_videos(created_at DESC);

-- Indexes cho user_follows
CREATE INDEX idx_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_follows_following ON public.user_follows(following_id);
CREATE INDEX idx_follows_tiktok ON public.user_follows(following_tiktok_username);

-- Indexes cho exchange_history
CREATE INDEX idx_exchange_user_video ON public.exchange_history(user_id, video_id);
CREATE INDEX idx_exchange_campaign ON public.exchange_history(campaign_id);
CREATE INDEX idx_exchange_created ON public.exchange_history(created_at DESC);
