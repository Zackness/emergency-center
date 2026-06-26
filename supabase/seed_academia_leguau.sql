-- Academia Leguau: registro de mascotas perdidas por Instagram/WhatsApp (no es web)
INSERT INTO external_links (title, description, url, category, locale, is_verified, is_active, sort_order)
VALUES (
  'Academia Leguau — Mascotas perdidas (Instagram)',
  'Registro por Instagram @academialeguau y WhatsApp 0424-159-65-90. Envía foto, nombre, especie, sexo, raza, ubicación, edad, colores/señas y contacto.',
  'https://www.instagram.com/academialeguau/',
  'pets',
  'both',
  false,
  true,
  1
)
ON CONFLICT DO NOTHING;
