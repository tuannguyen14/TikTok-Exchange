-- 1. Bảng người dùng
CREATE TABLE
    profiles (
        id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE, -- ID liên kết với hệ thống auth
        email VARCHAR(255) UNIQUE NOT NULL, -- Email đăng ký
        tiktok_username VARCHAR(100) UNIQUE, -- Tên người dùng TikTok
        credits INTEGER DEFAULT 0, -- Số dư credits hiện tại
        total_earned INTEGER DEFAULT 0, -- Tổng credits đã kiếm
        total_spent INTEGER DEFAULT 0, -- Tổng credits đã tiêu
        status VARCHAR(20) DEFAULT 'active', -- Trạng thái tài khoản (active, banned, ...)
        tiktok_stats JSONB DEFAULT '{}', -- Thông tin thống kê TikTok (cập nhật định kỳ)
        notification_settings JSONB DEFAULT '{"email": true, "push": true}', -- Cài đặt thông báo
        last_active_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Thời điểm hoạt động gần nhất
            created_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Thời điểm tạo
            updated_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Thời điểm cập nhật gần nhất
    );

-- 2. Bảng chiến dịch
CREATE TABLE
    campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (), -- ID campaign
        user_id UUID REFERENCES profiles (id) ON DELETE CASCADE, -- Người tạo campaign
        campaign_type VARCHAR(20) NOT NULL CHECK (campaign_type IN ('video', 'follow')), -- Loại campaign
        tiktok_video_id VARCHAR(100), -- ID video TikTok (nếu là campaign video)
        target_tiktok_username VARCHAR(100), -- Username cần follow (nếu là campaign follow)
        interaction_type VARCHAR(20), -- view, like, comment (chỉ dùng khi campaign_type = 'video')
        credits_per_action INTEGER NOT NULL, -- Số credits trả cho mỗi lượt
        target_count INTEGER NOT NULL, -- Mục tiêu lượt tương tác/follow
        current_count INTEGER DEFAULT 0, -- Đã đạt được bao nhiêu
        total_credits INTEGER NOT NULL, -- Tổng credits đã nạp cho campaign
        remaining_credits INTEGER NOT NULL, -- Credits còn lại
        status VARCHAR(20) DEFAULT 'active', -- Hạn campaign
        created_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Thời điểm tạo
            updated_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Thời điểm cập nhật gần nhất
    );

-- 3. Bảng actions (tương tác nhận credits)
CREATE TABLE
    actions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (), -- ID action
        user_id UUID REFERENCES profiles (id) ON DELETE CASCADE, -- Ai thực hiện action này
        campaign_id UUID REFERENCES campaigns (id) ON DELETE CASCADE, -- Campaign nào
        action_type VARCHAR(20) NOT NULL, -- view, like, comment, follow
        credits_earned INTEGER NOT NULL, -- Credits đã nhận
        status VARCHAR(20) DEFAULT 'completed', -- completed, pending (nếu cần duyệt proof)
        proof_data JSONB, -- (optional) dữ liệu xác minh
        created_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Thời điểm tạo
            UNIQUE (user_id, campaign_id, action_type) -- Không lặp action trùng
    );

-- 4. Bảng giao dịch (lịch sử cộng/trừ credits)
CREATE TABLE
    transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (), -- ID transaction
        user_id UUID REFERENCES profiles (id) ON DELETE CASCADE, -- Ai thực hiện
        type VARCHAR(20) NOT NULL, -- earn, spend, bonus, refund, ...
        amount INTEGER NOT NULL, -- Số lượng credits cộng/trừ
        balance_after INTEGER NOT NULL, -- Số dư credits sau transaction này
        description TEXT, -- Mô tả thêm
        reference_id UUID, -- Tham chiếu campaign/action (nếu có)
        reference_type VARCHAR(50), -- 'campaign', 'action', ...
        created_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Thời điểm tạo
    );

-- 5. Bảng thông báo cho user
CREATE TABLE
    notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (), -- ID thông báo
        user_id UUID REFERENCES profiles (id) ON DELETE CASCADE, -- User nhận thông báo
        type VARCHAR(50) NOT NULL, -- Loại thông báo
        title VARCHAR(200) NOT NULL, -- Tiêu đề thông báo
        message TEXT NOT NULL, -- Nội dung thông báo
        data JSONB, -- Dữ liệu phụ kèm theo (nếu có)
        is_read BOOLEAN DEFAULT FALSE, -- Đã đọc chưa
        created_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Thời điểm tạo
    );

-- 6. (Tùy chọn) Bảng cấu hình credits cho từng loại action
CREATE TABLE
    action_credit_values (
        action_type VARCHAR(20) PRIMARY KEY, -- view, like, comment, follow
        credit_value INTEGER NOT NULL -- Credits cho action đó
    );

CREATE TABLE
    action_credit_values (
        action_type VARCHAR(20) PRIMARY KEY, -- 'view', 'like', 'comment', 'follow'
        credit_value DECIMAL(8, 2) NOT NULL -- Số credits mặc định
    );

INSERT INTO
    action_credit_values (action_type, credit_value)
VALUES
    ('view', 1),
    ('like', 2),
    ('comment', 3),
    ('follow', 5);