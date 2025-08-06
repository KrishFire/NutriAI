-- Add has_completed_onboarding column to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN NOT NULL DEFAULT false;

-- Update existing users to have completed onboarding (they wouldn't have preferences otherwise)
UPDATE user_preferences 
SET has_completed_onboarding = true 
WHERE created_at < NOW();