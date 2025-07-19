-- =============================================================================
-- SQL FUNCTIONS VÀ TRIGGERS CHO TIKTOK EXCHANGE PLATFORM
-- =============================================================================

-- 1. FUNCTION: Tự động tạo profile khi có user mới
-- =============================================================================
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, credits, total_earned, total_spent, status, tiktok_stats, notification_settings, last_active_at, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        0, -- credits khởi tạo = 0
        0, -- total_earned = 0
        0, -- total_spent = 0
        'active', -- status mặc định
        '{}', -- tiktok_stats rỗng
        '{"email": true, "push": true}', -- notification_settings mặc định
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Tự động tạo profile khi có user mới trong auth.users
CREATE TRIGGER trigger_create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_profile_for_new_user();

-- =============================================================================
-- 2. FUNCTION: Tự động cập nhật credits trong profiles khi có transaction mới
-- =============================================================================
CREATE OR REPLACE FUNCTION update_profile_credits_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Cập nhật credits, total_earned, total_spent trong profiles
    UPDATE profiles 
    SET 
        credits = NEW.balance_after,
        total_earned = CASE 
            WHEN NEW.amount > 0 THEN total_earned + NEW.amount 
            ELSE total_earned 
        END,
        total_spent = CASE 
            WHEN NEW.amount < 0 THEN total_spent + ABS(NEW.amount)
            ELSE total_spent 
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Tự động cập nhật credits khi có transaction mới
CREATE TRIGGER trigger_update_credits_on_transaction
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_credits_on_transaction();

-- =============================================================================
-- 3. FUNCTION: Tự động cập nhật trạng thái campaign khi đạt target hoặc hết credits
-- =============================================================================
CREATE OR REPLACE FUNCTION update_campaign_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Cập nhật campaign status nếu đạt target hoặc hết credits
    UPDATE campaigns 
    SET 
        status = CASE 
            WHEN current_count >= target_count THEN 'completed'
            WHEN remaining_credits <= 0 THEN 'completed'
            ELSE status
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.campaign_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Tự động cập nhật trạng thái campaign khi có action mới
CREATE TRIGGER trigger_update_campaign_status_on_action
    AFTER INSERT ON actions
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_status();

-- =============================================================================
-- 4. FUNCTION: Tự động cập nhật trường updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Tự động cập nhật updated_at cho bảng profiles
CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Tự động cập nhật updated_at cho bảng campaigns
CREATE TRIGGER trigger_update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. FUNCTION: Tự động sinh transaction reward khi user hoàn thành action
-- =============================================================================
CREATE OR REPLACE FUNCTION create_reward_transaction_on_action()
RETURNS TRIGGER AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    -- Lấy số dư credits hiện tại của user
    SELECT credits INTO current_balance 
    FROM profiles 
    WHERE id = NEW.user_id;
    
    -- Tạo transaction reward cho action vừa hoàn thành
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
        current_balance + NEW.credits_earned,
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
    
    -- Cập nhật current_count và remaining_credits cho campaign
    UPDATE campaigns 
    SET 
        current_count = current_count + 1,
        remaining_credits = remaining_credits - NEW.credits_earned,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.campaign_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Tự động tạo transaction reward khi có action mới
CREATE TRIGGER trigger_create_reward_transaction
    AFTER INSERT ON actions
    FOR EACH ROW
    EXECUTE FUNCTION create_reward_transaction_on_action();