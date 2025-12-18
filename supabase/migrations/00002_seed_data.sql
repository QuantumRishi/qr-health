-- ============================================================
-- SEED DATA FOR QR-HEALTH
-- Run this after the main schema migration
-- ============================================================

-- Create default tenant for development
INSERT INTO tenants (
    name, 
    slug, 
    email, 
    subscription_tier, 
    subscription_status, 
    trial_ends_at,
    max_patients,
    max_staff
)
VALUES (
    'QR-Health Demo', 
    'default', 
    'admin@qr-health.app', 
    'professional', 
    'trial', 
    NOW() + INTERVAL '30 days',
    100,
    10
)
ON CONFLICT (slug) DO NOTHING;

-- Note: Users should be created through Supabase Auth
-- After a user signs up via Auth, their record will be inserted into the users table
-- with their tenant association

-- ============================================================
-- SAMPLE DATA COMMENTS
-- ============================================================
-- 
-- To test the schema, you can use the following steps:
-- 
-- 1. Create a user via Supabase Auth (email/password or magic link)
-- 2. The user will need to be added to the users table with a tenant_id
-- 3. Create a patient_profile for the user
-- 4. Add medications, exercises, and task schedules
-- 5. Log daily recovery data
-- 
-- Example SQL for manual testing (replace UUIDs with actual values):
-- 
-- -- Create a test user (after they've signed up via Auth)
-- INSERT INTO users (id, tenant_id, email, name, role)
-- SELECT 
--     'auth-user-uuid-here',
--     t.id,
--     'patient@example.com',
--     'Test Patient',
--     'patient'
-- FROM tenants t WHERE t.slug = 'default';
-- 
-- -- Create patient profile
-- INSERT INTO patient_profiles (user_id, tenant_id, display_name, recovery_start_date, recovery_type)
-- SELECT 
--     u.id,
--     u.tenant_id,
--     'Test Patient',
--     CURRENT_DATE - INTERVAL '7 days',
--     'surgery'
-- FROM users u WHERE u.email = 'patient@example.com';
-- 
-- ============================================================
