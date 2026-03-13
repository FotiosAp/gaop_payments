-- =============================================
-- GAOP Payments — Login Migration to Supabase
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================

-- 1. Enable pgcrypto extension (for bcrypt verification)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create users table
CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'manager'
);

-- 3. Enable Row Level Security (blocks direct reads via anon key)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. NO select/insert/update/delete policies → table is fully locked from client
-- Only the verify_login function (with SECURITY DEFINER) can access it

-- 5. Insert existing users (from db.json)
INSERT INTO users (username, password_hash, role) VALUES
    ('Gaop', '$2b$10$SqY55KysiWQaohPwGKABBOhkIXgQY8mMNZGHH9MtqwLl1whRkBplu', 'admin'),
    ('GaopAdmin2021!', '$2b$10$VGM2RqUOOL8aXzW7JB8DbuUJPwYwTbWszuMBfh8ILzeqn.vBi035C', 'manager')
ON CONFLICT (username) DO NOTHING;

-- 6. Create secure login function (runs as DB owner, not as anon)
CREATE OR REPLACE FUNCTION verify_login(p_username TEXT, p_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
BEGIN
    -- Find user
    SELECT username, password_hash, role INTO v_user
    FROM users
    WHERE username = p_username;

    -- User not found
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid credentials');
    END IF;

    -- Verify password using pgcrypto's crypt (compatible with bcryptjs $2b$ hashes)
    IF v_user.password_hash = crypt(p_password, v_user.password_hash) THEN
        RETURN json_build_object(
            'success', true,
            'username', v_user.username,
            'role', v_user.role
        );
    ELSE
        RETURN json_build_object('success', false, 'error', 'Invalid credentials');
    END IF;
END;
$$;

-- 7. Grant execute permission to anon role (so frontend can call it)
GRANT EXECUTE ON FUNCTION verify_login(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_login(TEXT, TEXT) TO authenticated;
