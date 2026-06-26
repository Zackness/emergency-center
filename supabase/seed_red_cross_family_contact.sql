-- Cruz Roja: servicio de restablecimiento del contacto familiar (afiche oficial)
UPDATE agencies SET
  phone = '0422-799-4880',
  description = 'Servicio de Restablecimiento del Contacto entre Familiares activado en emergencia. Si perdiste comunicación con algún familiar y necesitas saber si está bien, llama al 0422-799-4880. También: asistencia humanitaria, rescate y atención médica (0500-274-2222).',
  updated_at = now()
WHERE name ILIKE '%Cruz Roja%';

INSERT INTO emergency_numbers (label_es, label_en, number, sort_order, is_active)
SELECT
  'Cruz Roja — Contacto familiar',
  'Red Cross — Family contact',
  '0422-799-4880',
  5,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM emergency_numbers WHERE number = '0422-799-4880'
);
