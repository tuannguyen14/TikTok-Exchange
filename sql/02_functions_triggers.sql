-- =============================================================================
-- ENHANCED SQL FUNCTIONS VÀ TRIGGERS CHO TIKTOK EXCHANGE PLATFORM
-- =============================================================================

-- Drop existing triggers and functions to avoid conflicts
DROP TRIGGER IF EXISTS trigger_create_reward_transaction ON actions;
DROP TRIGGER IF EXISTS trigger_update_campaign_status_on_action ON actions;
DROP TRIGGER IF EXISTS trigger_update_credits_on_transaction ON transactions;
DROP FUNCTION IF EXISTS create_reward_transaction_on_action();
DROP FUNCTION IF EXISTS update_campaign_status();
DROP FUNCTION IF EXISTS update_profile_credits_on_transaction();

-- =============================================================================
-- 1. MAIN FUNCTION: Xử lý toàn bộ logic khi có action mới
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_action_complete()
RETURNS TRIGGER AS $$
DECLARE
    campaign_record campaigns%ROWTYPE;
    current_user_credits INTEGER;
    new_user_balance INTEGER;
BEGIN
    -- Lấy thông tin campaign
    SELECT * INTO campaign_record 
    FROM campaigns 
    WHERE id = NEW.campaign_id;
    
    -- Kiểm tra campaign có tồn tại không
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Campaign not found: %', NEW.campaign_id;
    END IF;
    
    -- Kiểm tra campaign có đủ credits không
    IF campaign_record.remaining_credits < NEW.credits_earned THEN
        RAISE EXCEPTION 'Campaign has insufficient credits. Remaining: %, Required: %', 
            campaign_record.remaining_credits, NEW.credits_earned;
    END IF;
    
    -- Kiểm tra campaign chưa đạt target
    IF campaign_record.current_count >= campaign_record.target_count THEN
        RAISE EXCEPTION 'Campaign target already reached. Current: %, Target: %', 
            campaign_record.current_count, campaign_record.target_count;
    END IF;
    
    -- Lấy credits hiện tại của user
    SELECT credits INTO current_user_credits 
    FROM profiles 
    WHERE id = NEW.user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found: %', NEW.user_id;
    END IF;
    
    -- Tính balance mới
    new_user_balance := current_user_credits + NEW.credits_earned;
    
    -- ==========================================================================
    -- CẬP NHẬT CAMPAIGN: current_count và remaining_credits
    -- ==========================================================================
    UPDATE campaigns 
    SET 
        current_count = current_count + 1,
        remaining_credits = remaining_credits - NEW.credits_earned,
        -- Tự động complete campaign nếu đạt target hoặc hết credits
        status = CASE 
            WHEN (current_count + 1) >= target_count THEN 'completed'
            WHEN (remaining_credits - NEW.credits_earned) <= 0 THEN 'completed'
            ELSE status
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.campaign_id;
    
    -- ==========================================================================
    -- CẬP NHẬT USER CREDITS: credits và total_earned
    -- ==========================================================================
    UPDATE profiles 
    SET 
        credits = new_user_balance,
        total_earned = total_earned + NEW.credits_earned,
        last_active_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
    
    -- ==========================================================================
    -- TẠO TRANSACTION RECORD
    -- ==========================================================================
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        balance_after,
        description,
        reference_id,
        reference_type,
        created_at
    ) VALUES (
        NEW.user_id,
        'earn',
        NEW.credits_earned,
        new_user_balance,
        CASE 
            WHEN NEW.action_type = 'view' THEN 'Earned credits for viewing TikTok video'
            WHEN NEW.action_type = 'like' THEN 'Earned credits for liking TikTok video'
            WHEN NEW.action_type = 'comment' THEN 'Earned credits for commenting on TikTok video'
            WHEN NEW.action_type = 'follow' THEN 'Earned credits for following TikTok account'
            ELSE 'Earned credits for action: ' || NEW.action_type
        END,
        NEW.id,
        'action',
        CURRENT_TIMESTAMP
    );
    
    -- ==========================================================================
    -- TẠO NOTIFICATION CHO USER
    -- ==========================================================================
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data,
        created_at
    ) VALUES (
        NEW.user_id,
        'credits_earned',
        'Credits Earned!',
        'You earned ' || NEW.credits_earned || ' credits for completing a ' || NEW.action_type || ' action',
        jsonb_build_object(
            'action_id', NEW.id,
            'campaign_id', NEW.campaign_id,
            'action_type', NEW.action_type,
            'credits_earned', NEW.credits_earned,
            'new_balance', new_user_balance
        ),
        CURRENT_TIMESTAMP
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Xử lý khi có action mới được completed
CREATE TRIGGER trigger_handle_action_complete
    AFTER INSERT ON actions
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION handle_action_complete();

-- =============================================================================
-- 2. FUNCTION: Xử lý khi user tạo campaign (spend credits)
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_campaign_creation()
RETURNS TRIGGER AS $$
DECLARE
    current_user_credits INTEGER;
    new_user_balance INTEGER;
BEGIN
    -- Lấy credits hiện tại của user
    SELECT credits INTO current_user_credits 
    FROM profiles 
    WHERE id = NEW.user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found: %', NEW.user_id;
    END IF;
    
    -- Kiểm tra user có đủ credits không
    IF current_user_credits < NEW.total_credits THEN
        RAISE EXCEPTION 'User has insufficient credits. Current: %, Required: %', 
            current_user_credits, NEW.total_credits;
    END IF;
    
    -- Tính balance mới
    new_user_balance := current_user_credits - NEW.total_credits;
    
    -- Cập nhật user credits
    UPDATE profiles 
    SET 
        credits = new_user_balance,
        total_spent = total_spent + NEW.total_credits,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
    
    -- Tạo transaction record
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        balance_after,
        description,
        reference_id,
        reference_type,
        created_at
    ) VALUES (
        NEW.user_id,
        'spend',
        -NEW.total_credits,
        new_user_balance,
        'Created ' || NEW.campaign_type || ' campaign: ' || COALESCE(NEW.target_tiktok_username, 'Unknown'),
        NEW.id,
        'campaign',
        CURRENT_TIMESTAMP
    );
    
    -- Tạo notification
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data,
        created_at
    ) VALUES (
        NEW.user_id,
        'campaign_created',
        'Campaign Created!',
        'Your ' || NEW.campaign_type || ' campaign has been created with ' || NEW.total_credits || ' credits',
        jsonb_build_object(
            'campaign_id', NEW.id,
            'campaign_type', NEW.campaign_type,
            'total_credits', NEW.total_credits,
            'target_count', NEW.target_count
        ),
        CURRENT_TIMESTAMP
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Xử lý khi tạo campaign mới
CREATE TRIGGER trigger_handle_campaign_creation
    AFTER INSERT ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION handle_campaign_creation();

-- =============================================================================
-- 3. FUNCTION: Xử lý refund khi campaign bị cancel
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_campaign_refund()
RETURNS TRIGGER AS $$
DECLARE
    refund_amount INTEGER;
    current_user_credits INTEGER;
    new_user_balance INTEGER;
BEGIN
    -- Chỉ xử lý khi campaign chuyển sang cancelled
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
        
        -- Tính số credits cần refund
        refund_amount := NEW.remaining_credits;
        
        IF refund_amount > 0 THEN
            -- Lấy credits hiện tại của user
            SELECT credits INTO current_user_credits 
            FROM profiles 
            WHERE id = NEW.user_id;
            
            -- Tính balance mới
            new_user_balance := current_user_credits + refund_amount;
            
            -- Cập nhật user credits
            UPDATE profiles 
            SET 
                credits = new_user_balance,
                total_spent = total_spent - refund_amount,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.user_id;
            
            -- Tạo transaction record
            INSERT INTO transactions (
                user_id,
                type,
                amount,
                balance_after,
                description,
                reference_id,
                reference_type,
                created_at
            ) VALUES (
                NEW.user_id,
                'refund',
                refund_amount,
                new_user_balance,
                'Refund for cancelled campaign: ' || COALESCE(NEW.target_tiktok_username, 'Unknown'),
                NEW.id,
                'campaign',
                CURRENT_TIMESTAMP
            );
            
            -- Clear remaining credits
            NEW.remaining_credits := 0;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Xử lý refund khi campaign cancelled
CREATE TRIGGER trigger_handle_campaign_refund
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION handle_campaign_refund();

-- =============================================================================
-- 4. FUNCTION: Tự động cập nhật updated_at (existing, no changes)
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers: Tự động cập nhật updated_at
DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_campaigns_updated_at ON campaigns;
CREATE TRIGGER trigger_update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. FUNCTION: Tự động tạo profile khi có user mới (existing, no changes)
-- =============================================================================
-- Function: Tạo profile cho user mới
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Chỉ tạo profile nếu chưa tồn tại (tránh duplicate)
    INSERT INTO public.profiles (
        id, 
        email, 
        credits, 
        total_earned, 
        total_spent, 
        status, 
        tiktok_stats, 
        notification_settings, 
        last_active_at, 
        created_at, 
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.email, NEW.raw_user_meta_data->>'email'), -- Lấy email từ metadata nếu cần
        0, -- credits khởi tạo
        0, -- total_earned
        0, -- total_spent
        'active', -- status mặc định
        '{}', -- tiktok_stats rỗng
        '{"email": true, "push": true}', -- notification_settings mặc định
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO NOTHING; -- Tránh lỗi nếu profile đã tồn tại
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log lỗi nhưng không làm fail quá trình signup
        RAISE WARNING 'Could not create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Tự động tạo profile khi có user mới
DROP TRIGGER IF EXISTS trigger_create_profile_on_signup ON auth.users;

CREATE TRIGGER trigger_create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_profile_for_new_user();

-- =============================================================================
-- 6. UTILITY FUNCTIONS cho stats
-- =============================================================================

-- Function to get user exchange stats
CREATE OR REPLACE FUNCTION get_user_exchange_stats(user_uuid UUID)
RETURNS TABLE (
    total_campaigns_available INTEGER,
    active_campaigns_available INTEGER,
    completed_actions INTEGER,
    pending_actions INTEGER,
    total_credits_earned INTEGER,
    current_credits INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM campaigns WHERE user_id != user_uuid) as total_campaigns_available,
        (SELECT COUNT(*)::INTEGER FROM campaigns WHERE user_id != user_uuid AND status = 'active') as active_campaigns_available,
        (SELECT COUNT(*)::INTEGER FROM actions WHERE user_id = user_uuid AND status = 'completed') as completed_actions,
        (SELECT COUNT(*)::INTEGER FROM actions WHERE user_id = user_uuid AND status = 'pending') as pending_actions,
        (SELECT COALESCE(SUM(credits_earned), 0)::INTEGER FROM actions WHERE user_id = user_uuid AND status = 'completed') as total_credits_earned,
        (SELECT credits FROM profiles WHERE id = user_uuid) as current_credits;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can perform action on campaign
CREATE OR REPLACE FUNCTION can_user_perform_action(
    user_uuid UUID, 
    campaign_uuid UUID, 
    action_type_param TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    campaign_record campaigns%ROWTYPE;
    existing_action_count INTEGER;
BEGIN
    -- Get campaign info
    SELECT * INTO campaign_record FROM campaigns WHERE id = campaign_uuid;
    
    -- Check if campaign exists and is active
    IF NOT FOUND OR campaign_record.status != 'active' THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user is not the campaign owner
    IF campaign_record.user_id = user_uuid THEN
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
    WHERE user_id = user_uuid 
      AND campaign_id = campaign_uuid 
      AND action_type = action_type_param;
    
    IF existing_action_count > 0 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;