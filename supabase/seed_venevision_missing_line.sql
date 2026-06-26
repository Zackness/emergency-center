-- Línea Venevisión para reportar desaparecidos (no es sitio web)
INSERT INTO emergency_numbers (label_es, label_en, number, sort_order, is_active)
SELECT
  'Venevisión — Desaparecidos',
  'Venevisión — Missing persons',
  '0414-3109169',
  6,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM emergency_numbers WHERE number = '0414-3109169'
);
