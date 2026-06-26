-- Categoría tools para enlaces de herramientas offline
ALTER TYPE link_category ADD VALUE IF NOT EXISTS 'tools';

INSERT INTO external_links (title, description, url, category, locale, is_verified, is_active, sort_order)
VALUES (
  'BitChat — Chat sin internet',
  'App de mensajería por Bluetooth mesh. Funciona sin internet, Wi‑Fi ni datos. Ideal para emergencias y cortes de comunicación.',
  'https://play.google.com/store/apps/details?id=com.bitchat.bluetooth',
  'tools',
  'both',
  true,
  true,
  1
);
