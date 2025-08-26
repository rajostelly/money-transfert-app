-- Create test users for the money transfer app
-- All users will have password: "password123"

INSERT INTO neon_auth.users_sync (
    id,
    email,
    name,
    raw_json,
    created_at,
    updated_at
) VALUES 
-- Client users
(
    'client1-uuid-' || extract(epoch from now())::text,
    'client1@test.com',
    'Client One',
    jsonb_build_object(
        'id', 'client1-uuid-' || extract(epoch from now())::text,
        'email', 'client1@test.com',
        'name', 'Client One',
        'role', 'client',
        'password', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'created_at', now(),
        'updated_at', now()
    ),
    now(),
    now()
),
(
    'client2-uuid-' || extract(epoch from now())::text,
    'client2@test.com',
    'Client Two',
    jsonb_build_object(
        'id', 'client2-uuid-' || extract(epoch from now())::text,
        'email', 'client2@test.com',
        'name', 'Client Two',
        'role', 'client',
        'password', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'created_at', now(),
        'updated_at', now()
    ),
    now(),
    now()
),
(
    'client3-uuid-' || extract(epoch from now())::text,
    'client3@test.com',
    'Client Three',
    jsonb_build_object(
        'id', 'client3-uuid-' || extract(epoch from now())::text,
        'email', 'client3@test.com',
        'name', 'Client Three',
        'role', 'client',
        'password', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'created_at', now(),
        'updated_at', now()
    ),
    now(),
    now()
),
(
    'client4-uuid-' || extract(epoch from now())::text,
    'client4@test.com',
    'Client Four',
    jsonb_build_object(
        'id', 'client4-uuid-' || extract(epoch from now())::text,
        'email', 'client4@test.com',
        'name', 'Client Four',
        'role', 'client',
        'password', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'created_at', now(),
        'updated_at', now()
    ),
    now(),
    now()
),
-- Admin user
(
    'admin-uuid-' || extract(epoch from now())::text,
    'admin@test.com',
    'Admin User',
    jsonb_build_object(
        'id', 'admin-uuid-' || extract(epoch from now())::text,
        'email', 'admin@test.com',
        'name', 'Admin User',
        'role', 'admin',
        'password', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'created_at', now(),
        'updated_at', now()
    ),
    now(),
    now()
),
-- Madagascar team users
(
    'madagascar1-uuid-' || extract(epoch from now())::text,
    'madagascar1@test.com',
    'Madagascar One',
    jsonb_build_object(
        'id', 'madagascar1-uuid-' || extract(epoch from now())::text,
        'email', 'madagascar1@test.com',
        'name', 'Madagascar One',
        'role', 'madagascar_team',
        'password', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'created_at', now(),
        'updated_at', now()
    ),
    now(),
    now()
),
(
    'madagascar2-uuid-' || extract(epoch from now())::text,
    'madagascar2@test.com',
    'Madagascar Two',
    jsonb_build_object(
        'id', 'madagascar2-uuid-' || extract(epoch from now())::text,
        'email', 'madagascar2@test.com',
        'name', 'Madagascar Two',
        'role', 'madagascar_team',
        'password', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'created_at', now(),
        'updated_at', now()
    ),
    now(),
    now()
);

-- Verify the users were created
SELECT email, name, raw_json->>'role' as role FROM neon_auth.users_sync ORDER BY email;
