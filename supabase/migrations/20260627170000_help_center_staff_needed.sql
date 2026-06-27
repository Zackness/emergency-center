ALTER TABLE help_centers
  ADD COLUMN IF NOT EXISTS staff_needed TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS staff_needed_notes TEXT;
