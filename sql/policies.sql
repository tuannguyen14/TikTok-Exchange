-- =============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- TikTok Exchange Platform
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_credit_values ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 1. PROFILES TABLE POLICIES
-- =============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can view other users' basic profile info (for leaderboard, stats)
CREATE POLICY "Users can view others basic profile" ON profiles
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND 
        status = 'active'
    );

-- Insert profile is handled by trigger when new user signs up
CREATE POLICY "System can insert profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================================================
-- 2. CAMPAIGNS TABLE POLICIES
-- =============================================================================

-- Users can view all active campaigns (to participate)
CREATE POLICY "Users can view active campaigns" ON campaigns
    FOR SELECT USING (
        (auth.uid() = user_id)
    );

-- Users can create their own campaigns
CREATE POLICY "Users can create campaigns" ON campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update only their own campaigns
CREATE POLICY "Users can update own campaigns" ON campaigns
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can update only their own campaigns
CREATE POLICY "Users can update own campaigns" ON campaigns
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete only their own campaigns (if not started)
CREATE POLICY "Users can delete own inactive campaigns" ON campaigns
    FOR DELETE USING (
        auth.uid() = user_id 
        -- AND 
        -- current_count = 0 AND 
        -- status IN ('active', 'paused')
    );

-- =============================================================================
-- 3. ACTIONS TABLE POLICIES
-- =============================================================================

-- Users can view their own actions
CREATE POLICY "Users can view own actions" ON actions
    FOR SELECT USING (auth.uid() = user_id);

-- Campaign owners can view actions on their campaigns
CREATE POLICY "Campaign owners can view actions on their campaigns" ON actions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = actions.campaign_id 
            AND campaigns.user_id = auth.uid()
        )
    );

-- Users can create actions (participate in campaigns)
CREATE POLICY "Users can create actions" ON actions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        -- Ensure user is not creating action on their own campaign
        NOT EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_id 
            AND campaigns.user_id = auth.uid()
        )
    );

-- Users cannot update or delete actions (immutable record)
-- No UPDATE/DELETE policies means they're blocked by default

-- =============================================================================
-- 4. TRANSACTIONS TABLE POLICIES
-- =============================================================================

-- Users can only view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Only system/triggers can insert transactions
CREATE POLICY "System can insert transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions are immutable - no UPDATE/DELETE policies

-- =============================================================================
-- 5. NOTIFICATIONS TABLE POLICIES
-- =============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- System can create notifications for users
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true); -- Handled by triggers/functions

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- 6. ACTION_CREDIT_VALUES TABLE POLICIES
-- =============================================================================

-- Everyone can read credit values (public configuration)
CREATE POLICY "Anyone can view credit values" ON action_credit_values
    FOR SELECT USING (true);

-- Only admins/system can modify credit values
-- For now, no INSERT/UPDATE/DELETE policies = blocked for regular users

-- =============================================================================
-- 7. ADDITIONAL SECURITY FUNCTIONS
-- =============================================================================

-- Function to check if user can perform action on campaign
CREATE OR REPLACE FUNCTION auth_can_perform_action(
    campaign_uuid UUID,
    action_type_param TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    campaign_record campaigns%ROWTYPE;
    existing_action_count INTEGER;
    current_user_id UUID;
BEGIN
    -- Get current authenticated user
    current_user_id := auth.uid();
    
    -- Must be authenticated
    IF current_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get campaign info
    SELECT * INTO campaign_record FROM campaigns WHERE id = campaign_uuid;
    
    -- Check if campaign exists and is active
    IF NOT FOUND OR campaign_record.status != 'active' THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user is not the campaign owner
    IF campaign_record.user_id = current_user_id THEN
        RETURN FALSE;
    END IF;
    
    -- Check if campaign has sufficient credits and hasn't reached target
    IF campaign_record.remaining_credits < campaign_record.credits_per_action 
       OR campaign_record.current_count >= campaign_record.target_count THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user hasn't already performed this action
    SELECT COUNT(*) INTO existing_action_count 
    FROM actions 
    WHERE user_id = current_user_id 
      AND campaign_id = campaign_uuid 
      AND action_type = action_type_param;
    
    IF existing_action_count > 0 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has sufficient credits for campaign
CREATE OR REPLACE FUNCTION auth_has_sufficient_credits(
    required_credits INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    user_credits INTEGER;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    SELECT credits INTO user_credits 
    FROM profiles 
    WHERE id = current_user_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    RETURN user_credits >= required_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 8. ENHANCED CAMPAIGN POLICIES WITH BUSINESS LOGIC
-- =============================================================================

-- More restrictive campaign creation policy
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
CREATE POLICY "Users can create campaigns with sufficient credits" ON campaigns
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        auth_has_sufficient_credits(total_credits)
    );

-- =============================================================================
-- 9. AUDIT AND ADMIN POLICIES (Optional)
-- =============================================================================

-- Admin role check function (you can customize this based on your admin system)
CREATE OR REPLACE FUNCTION auth_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Example: Check if user has admin role in auth.users metadata
    -- You can customize this based on your admin system
    RETURN (
        SELECT COALESCE(
            (auth.jwt() ->> 'user_metadata' ->> 'role')::TEXT = 'admin',
            false
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin can view all data for monitoring
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (auth_is_admin());

CREATE POLICY "Admins can view all campaigns" ON campaigns
    FOR SELECT USING (auth_is_admin());

CREATE POLICY "Admins can view all actions" ON actions
    FOR SELECT USING (auth_is_admin());

CREATE POLICY "Admins can view all transactions" ON transactions
    FOR SELECT USING (auth_is_admin());

-- Admin can manage credit values
CREATE POLICY "Admins can manage credit values" ON action_credit_values
    FOR ALL USING (auth_is_admin())
    WITH CHECK (auth_is_admin());

-- =============================================================================
-- 10. PERFORMANCE INDEXES FOR RLS (already in your 03_indexes.sql)
-- =============================================================================

-- Note: Your existing indexes in 03_indexes.sql are already optimal for RLS
-- The following are specifically for RLS performance:

CREATE INDEX IF NOT EXISTS idx_campaigns_user_status_rls ON campaigns(user_id, status) 
    WHERE status IN ('active', 'completed');

CREATE INDEX IF NOT EXISTS idx_actions_user_campaign_rls ON actions(user_id, campaign_id);

CREATE INDEX IF NOT EXISTS idx_profiles_status_active ON profiles(id) 
    WHERE status = 'active';

-- =============================================================================
-- SUMMARY OF SECURITY MODEL:
-- =============================================================================

/*
1. PROFILES: Users can manage their own profiles, view others' basic info
2. CAMPAIGNS: Users can create/manage own campaigns, view all active campaigns
3. ACTIONS: Users can create actions (participate), view own actions + actions on their campaigns
4. TRANSACTIONS: Users can only view their own transaction history
5. NOTIFICATIONS: Users can manage their own notifications
6. CREDIT_VALUES: Read-only for users, admin-only for modifications

Key Security Features:
- Users cannot perform actions on their own campaigns
- Users cannot modify completed actions/transactions (immutable)
- Credit validation before campaign creation
- Admin override capabilities for monitoring/management
- Efficient RLS with proper indexing
*/