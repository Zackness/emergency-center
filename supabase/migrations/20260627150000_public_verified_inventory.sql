-- Inventario y facturas públicas solo para centros verificados y activos.
-- Realtime para movimientos con factura.

CREATE POLICY "Public read verified center inventory" ON inventory_items
  FOR SELECT USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM help_centers h
      WHERE h.id = inventory_items.help_center_id
        AND h.is_active = true
        AND h.is_verified = true
    )
  );

CREATE POLICY "Public read verified center invoice movements" ON inventory_movements
  FOR SELECT USING (
    invoice_url IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM inventory_items i
      INNER JOIN help_centers h ON h.id = i.help_center_id
      WHERE i.id = inventory_movements.item_id
        AND i.is_active = true
        AND h.is_active = true
        AND h.is_verified = true
    )
  );

DROP POLICY IF EXISTS "Public read active help_centers" ON help_centers;
CREATE POLICY "Public read active help_centers" ON help_centers
  FOR SELECT USING (is_active = true AND is_verified = true);

ALTER PUBLICATION supabase_realtime ADD TABLE inventory_movements;
