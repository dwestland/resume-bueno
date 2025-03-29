-- Create the user_role enum type
CREATE TYPE "user_role" AS ENUM ('USER', 'MANAGER', 'ADMIN');

-- Add the role column to the user table with default value 'USER'
ALTER TABLE "user" ADD COLUMN "role" "user_role" NOT NULL DEFAULT 'USER'; 