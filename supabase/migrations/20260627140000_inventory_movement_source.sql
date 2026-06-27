-- Origen de entradas de inventario (donación vs compra) y factura

CREATE TYPE inventory_inbound_source AS ENUM ('donation', 'purchase');

ALTER TABLE inventory_movements
  ADD COLUMN IF NOT EXISTS source_type inventory_inbound_source,
  ADD COLUMN IF NOT EXISTS invoice_url TEXT;
