
-- =============================================================================
-- INDEX tối ưu performance
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_actions_user_id ON actions(user_id);
CREATE INDEX IF NOT EXISTS idx_actions_campaign_id ON actions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_actions_created_at ON actions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_profiles_tiktok_username ON profiles(tiktok_username);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at ON profiles(last_active_at);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id_status ON campaigns(user_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_status_created_at ON campaigns(status, created_at);
CREATE INDEX IF NOT EXISTS idx_actions_user_campaign ON actions(user_id, campaign_id, action_type);
CREATE INDEX IF NOT EXISTS idx_actions_status_created_at ON actions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);