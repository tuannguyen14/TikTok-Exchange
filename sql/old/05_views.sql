-- Thống kê người dùng
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
    p.*,
    COALESCE(v.video_count, 0) as total_videos,
    COALESCE(c.campaign_count, 0) as total_campaigns,
    COALESCE(a.action_count, 0) as total_actions
FROM public.profiles p
LEFT JOIN (
    SELECT user_id, COUNT(*) as video_count FROM public.videos GROUP BY user_id
) v ON p.id = v.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as campaign_count FROM public.campaigns GROUP BY user_id
) c ON p.id = c.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as action_count FROM public.actions GROUP BY user_id
) a ON p.id = a.user_id;

-- Chiến dịch đang hoạt động
CREATE OR REPLACE VIEW public.active_campaigns AS
SELECT 
    c.*,
    p.tiktok_username as creator_tiktok,
    v.title as video_title,
    v.video_url,
    v.category
FROM public.campaigns c
JOIN public.profiles p ON c.user_id = p.id
JOIN public.videos v ON c.video_id = v.id
WHERE c.status = 'active'
AND (c.expires_at IS NULL OR c.expires_at > CURRENT_TIMESTAMP)
ORDER BY c.created_at DESC;

-- Bảng xếp hạng chiến dịch
CREATE OR REPLACE VIEW public.campaign_leaderboard AS
SELECT 
    p.email,
    p.tiktok_username,
    COUNT(c.id) as total_campaigns,
    SUM(c.current_count) as total_actions_received,
    SUM(c.total_credits - c.remaining_credits) as total_credits_spent
FROM public.profiles p
LEFT JOIN public.campaigns c ON p.id = c.user_id
GROUP BY p.id
ORDER BY total_actions_received DESC;

-- Bảng xếp hạng người dùng
CREATE OR REPLACE VIEW public.action_leaderboard AS
SELECT 
    p.email,
    p.tiktok_username,
    COUNT(a.id) as total_actions,
    SUM(a.credits_earned) as total_credits_earned
FROM public.profiles p
LEFT JOIN public.actions a ON p.id = a.user_id
GROUP BY p.id
ORDER BY total_actions DESC;

CREATE OR REPLACE VIEW public.user_social_stats AS
SELECT 
    p.id,
    p.email,
    p.tiktok_username,
    (SELECT COUNT(*) FROM user_follows WHERE following_id = p.id) as followers_count,
    (SELECT COUNT(*) FROM user_follows WHERE follower_id = p.id) as following_count,
    (SELECT COUNT(*) FROM saved_videos WHERE user_id = p.id) as saved_videos_count
FROM public.profiles p;

-- View video với full stats
CREATE OR REPLACE VIEW public.videos_with_stats AS
SELECT 
    v.*,
    p.tiktok_username as owner_username,
    COUNT(DISTINCT c.id) as total_campaigns,
    COUNT(DISTINCT a.id) as total_actions,
    COUNT(DISTINCT sv.id) as total_saves
FROM public.videos v
LEFT JOIN public.profiles p ON v.user_id = p.id
LEFT JOIN public.campaigns c ON v.id = c.video_id
LEFT JOIN public.actions a ON v.id = a.video_id
LEFT JOIN public.saved_videos sv ON v.id = sv.video_id
GROUP BY v.id, p.tiktok_username;

-- View chiến dịch với thông tin chi tiết
CREATE OR REPLACE VIEW public.campaigns_detailed AS
SELECT 
    c.*,
    v.video_url,
    v.title as video_title,
    v.video_id,
    v.category,
    p.tiktok_username,
    ROUND((c.current_count::NUMERIC / NULLIF(c.target_count, 0)) * 100, 2) as completion_percentage
FROM public.campaigns c
JOIN public.videos v ON c.video_id = v.id
JOIN public.profiles p ON c.user_id = p.id;