-- Add meal_group_id to properly group meal entries from the same AI analysis
-- This allows multiple food items from one meal to be linked together

ALTER TABLE meal_entries 
ADD COLUMN meal_group_id UUID;

-- Add index for efficient querying by meal group
CREATE INDEX IF NOT EXISTS idx_meal_entries_meal_group_id 
ON meal_entries (meal_group_id);

-- Add comment for documentation
COMMENT ON COLUMN meal_entries.meal_group_id IS 
'Groups multiple meal_entries that belong to the same analyzed meal. Used for AI corrections and meal management.';