-- Universities table
CREATE TABLE IF NOT EXISTS universities (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text        NOT NULL,
  country           text,
  city              text,
  website           text,
  admissions_email  text,
  description       text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER universities_updated_at
  BEFORE UPDATE ON universities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Application requirements table
CREATE TABLE IF NOT EXISTS application_requirements (
  id             uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id  uuid     NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  label          text     NOT NULL,
  required       boolean  NOT NULL DEFAULT true,
  format         text,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Application history table (ready for when auth is added)
CREATE TABLE IF NOT EXISTS application_history (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id    uuid        NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  university_name  text        NOT NULL,
  program          text        NOT NULL,
  student_name     text        NOT NULL,
  file_names       text[]      NOT NULL DEFAULT '{}',
  email_subject    text,
  user_id          uuid,
  sent_at          timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_requirements_university
  ON application_requirements(university_id);

CREATE INDEX IF NOT EXISTS idx_history_university
  ON application_history(university_id);

CREATE INDEX IF NOT EXISTS idx_history_user
  ON application_history(user_id);

-- Row Level Security
ALTER TABLE universities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_history   ENABLE ROW LEVEL SECURITY;

-- Universities: anyone can read, only service role can write
CREATE POLICY "public read universities"
  ON universities FOR SELECT USING (true);

CREATE POLICY "service role write universities"
  ON universities FOR ALL USING (auth.role() = 'service_role');

-- Requirements: anyone can read, only service role can write
CREATE POLICY "public read requirements"
  ON application_requirements FOR SELECT USING (true);

CREATE POLICY "service role write requirements"
  ON application_requirements FOR ALL USING (auth.role() = 'service_role');

-- History: users can only read their own rows (once auth is live)
-- For now, service role handles all writes
CREATE POLICY "users read own history"
  ON application_history FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "service role write history"
  ON application_history FOR ALL USING (auth.role() = 'service_role');