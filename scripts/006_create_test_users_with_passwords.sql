-- Script to add password hashes for test users
-- This script adds password field and updates test users with hashed passwords

-- Add password column if it doesn't exist
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- Update test users with password hashes
-- All test users will have password "password123" (base64 encoded for simplicity in testing)
UPDATE "users" SET 
    "password" = 'cGFzc3dvcmQxMjM=', -- base64 encoded "password123"
    "updatedAt" = NOW()
WHERE "email" IN (
    'client1@test.com',
    'client2@test.com', 
    'client3@test.com',
    'client4@test.com',
    'admin@test.com',
    'madagascar1@test.com',
    'madagascar2@test.com'
);

COMMIT;
