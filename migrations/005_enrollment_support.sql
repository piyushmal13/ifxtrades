-- Migration 005: Course Enrollment Support

CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES university_courses(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'enrolled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- RLS
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own enrollments" ON course_enrollments;
CREATE POLICY "Users can view their own enrollments" ON course_enrollments FOR SELECT USING (auth.uid() = user_id);
