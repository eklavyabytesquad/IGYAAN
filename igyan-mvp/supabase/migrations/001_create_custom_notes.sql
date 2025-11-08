-- Create custom_notes table for user-uploaded study notes
-- This table allows students to upload and manage their personal notes (max 1000 characters)
-- Notes are grade-specific and integrated with the Viva AI chat assistant

CREATE TABLE IF NOT EXISTS custom_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL CHECK (length(content) <= 1000),
    grade TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_custom_notes_user_id ON custom_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_notes_grade ON custom_notes(grade);
CREATE INDEX IF NOT EXISTS idx_custom_notes_user_grade ON custom_notes(user_id, grade);

-- Enable Row Level Security
ALTER TABLE custom_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own notes
CREATE POLICY "Users can view own notes" ON custom_notes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own notes
CREATE POLICY "Users can insert own notes" ON custom_notes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own notes
CREATE POLICY "Users can update own notes" ON custom_notes
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete own notes" ON custom_notes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_notes_updated_at
    BEFORE UPDATE ON custom_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE custom_notes IS 'User-uploaded custom study notes with 1000 character limit';
COMMENT ON COLUMN custom_notes.id IS 'Unique identifier for the note';
COMMENT ON COLUMN custom_notes.user_id IS 'Foreign key to auth.users';
COMMENT ON COLUMN custom_notes.title IS 'Title of the custom note';
COMMENT ON COLUMN custom_notes.content IS 'Note content (max 1000 characters)';
COMMENT ON COLUMN custom_notes.grade IS 'Grade level for the note (9, 10, 11, 12)';
COMMENT ON COLUMN custom_notes.created_at IS 'Timestamp when note was created';
COMMENT ON COLUMN custom_notes.updated_at IS 'Timestamp when note was last updated';
