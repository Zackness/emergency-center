-- Voluntarios por centro de acopio + inventario + coordinadores

CREATE TYPE volunteer_registration_status AS ENUM ('pending', 'active', 'inactive');
CREATE TYPE inventory_movement_type AS ENUM ('inbound', 'outbound', 'adjustment');

ALTER TABLE volunteer_registrations
  ADD COLUMN IF NOT EXISTS help_center_id UUID REFERENCES help_centers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status volunteer_registration_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_volunteer_registrations_center ON volunteer_registrations(help_center_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_registrations_status ON volunteer_registrations(status);

CREATE TABLE help_center_coordinators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  help_center_id UUID NOT NULL REFERENCES help_centers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, help_center_id)
);

CREATE INDEX idx_help_center_coordinators_center ON help_center_coordinators(help_center_id);

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  help_center_id UUID NOT NULL REFERENCES help_centers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'unidad',
  quantity_on_hand DOUBLE PRECISION NOT NULL DEFAULT 0,
  minimum_stock DOUBLE PRECISION,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_items_center ON inventory_items(help_center_id);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);

CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  type inventory_movement_type NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  donor_name TEXT,
  destination TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_movements_item ON inventory_movements(item_id);
CREATE INDEX idx_inventory_movements_created ON inventory_movements(created_at DESC);

-- Coordinador de un centro o admin
CREATE OR REPLACE FUNCTION can_manage_help_center(center_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM help_center_coordinators
    WHERE profile_id = auth.uid() AND help_center_id = center_id
  );
$$;

ALTER TABLE help_center_coordinators ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage coordinators" ON help_center_coordinators
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Coordinators read own assignments" ON help_center_coordinators
  FOR SELECT USING (profile_id = auth.uid() OR is_admin());

CREATE POLICY "Center managers read inventory" ON inventory_items
  FOR SELECT USING (can_manage_help_center(help_center_id));

CREATE POLICY "Center managers write inventory" ON inventory_items
  FOR ALL USING (can_manage_help_center(help_center_id))
  WITH CHECK (can_manage_help_center(help_center_id));

CREATE POLICY "Center managers read movements" ON inventory_movements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM inventory_items i
      WHERE i.id = item_id AND can_manage_help_center(i.help_center_id)
    )
  );

CREATE POLICY "Center managers write movements" ON inventory_movements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM inventory_items i
      WHERE i.id = item_id AND can_manage_help_center(i.help_center_id)
    )
  );

CREATE POLICY "Coordinators read center volunteers" ON volunteer_registrations
  FOR SELECT USING (
    is_admin()
    OR (help_center_id IS NOT NULL AND can_manage_help_center(help_center_id))
  );

CREATE POLICY "Coordinators update center volunteers" ON volunteer_registrations
  FOR UPDATE USING (
    is_admin()
    OR (help_center_id IS NOT NULL AND can_manage_help_center(help_center_id))
  );

ALTER PUBLICATION supabase_realtime ADD TABLE inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE volunteer_registrations;
