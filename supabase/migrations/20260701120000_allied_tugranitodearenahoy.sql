-- Tu Granito de Arena Hoy: difusión de donación de sangre (@tugranitodearenahoy)
INSERT INTO allied_platforms (domain, url, description_es, description_en, color, sort_order)
SELECT
  'instagram.com/tugranitodearenahoy',
  'https://www.instagram.com/tugranitodearenahoy/',
  'Tu Granito de Arena Hoy: difunde dónde donar sangre en Caracas y alrededores. Cada donación puede salvar hasta tres vidas.',
  'Tu Granito de Arena Hoy: shares where to donate blood in Caracas and nearby. Each donation can save up to three lives.',
  'red'::allied_platform_color,
  25
WHERE NOT EXISTS (
  SELECT 1 FROM allied_platforms WHERE lower(domain) = lower('instagram.com/tugranitodearenahoy')
);
