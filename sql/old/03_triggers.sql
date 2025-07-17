-- Kích hoạt khi tạo người dùng mới
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Kích hoạt khi tạo chiến dịch
-- CREATE TRIGGER on_campaign_created
-- AFTER INSERT ON public.campaigns
-- FOR EACH ROW EXECUTE FUNCTION public.deduct_campaign_credits();