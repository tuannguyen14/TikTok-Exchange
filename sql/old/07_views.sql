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
    p.email as creator_email,
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