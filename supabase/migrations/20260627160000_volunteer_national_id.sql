ALTER TABLE volunteer_registrations
  ADD COLUMN IF NOT EXISTS national_id TEXT;

CREATE INDEX IF NOT EXISTS volunteer_registrations_national_id_idx
  ON volunteer_registrations (national_id);
