-- Add correction_history column to meal_entries table
-- This stores the conversation history for AI meal corrections in OpenAI chat format

ALTER TABLE meal_entries 
ADD COLUMN correction_history jsonb DEFAULT '[]'::jsonb;

-- Add index for efficient querying of correction history
CREATE INDEX IF NOT EXISTS idx_meal_entries_correction_history 
ON meal_entries USING GIN (correction_history);

-- Add comment for documentation
COMMENT ON COLUMN meal_entries.correction_history IS 
'Stores conversation history for AI meal corrections in OpenAI chat completion format: [{"role": "assistant|user", "content": "..."}]';