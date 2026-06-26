-- Redes sociales oficiales (ejecutar tras 20260626120000_social_links.sql)

UPDATE agencies SET social_links = '[
  {"platform":"instagram","url":"https://www.instagram.com/inamehoficial/","handle":"@inamehoficial"},
  {"platform":"twitter","url":"https://x.com/INAMEH","handle":"@INAMEH"},
  {"platform":"facebook","url":"https://www.facebook.com/INAMEH","handle":"INAMEH"}
]'::jsonb
WHERE name ILIKE '%INAMEH%' OR name ILIKE '%Protección Civil%';

UPDATE agencies SET social_links = '[
  {"platform":"instagram","url":"https://www.instagram.com/cruzrojave/","handle":"@cruzrojave"},
  {"platform":"twitter","url":"https://x.com/CruzRojaVe","handle":"@CruzRojaVe"},
  {"platform":"facebook","url":"https://www.facebook.com/crvenezuela","handle":"Cruz Roja Venezolana"}
]'::jsonb
WHERE name ILIKE '%Cruz Roja%';

UPDATE agencies SET social_links = '[
  {"platform":"instagram","url":"https://www.instagram.com/dgnbenlinea/","handle":"@dgnbenlinea"},
  {"platform":"twitter","url":"https://x.com/FBomberos","handle":"@FBomberos"},
  {"platform":"facebook","url":"https://www.facebook.com/dgnbvenezuela","handle":"DGNB Venezuela"}
]'::jsonb
WHERE category = 'firefighters';

UPDATE agencies SET social_links = '[
  {"platform":"instagram","url":"https://www.instagram.com/minsalud_ve/","handle":"@minsalud_ve"},
  {"platform":"twitter","url":"https://x.com/minsalud_ve","handle":"@minsalud_ve"},
  {"platform":"facebook","url":"https://www.facebook.com/minsaludve","handle":"MinSalud VE"}
]'::jsonb
WHERE name ILIKE '%Salud%';

UPDATE agencies SET social_links = '[
  {"platform":"instagram","url":"https://www.instagram.com/funvisis/","handle":"@funvisis"},
  {"platform":"twitter","url":"https://x.com/FUNVISIS","handle":"@FUNVISIS"}
]'::jsonb
WHERE name ILIKE '%FUNVISIS%';

UPDATE agencies SET social_links = '[
  {"platform":"instagram","url":"https://www.instagram.com/pnb_ve/","handle":"@pnb_ve"},
  {"platform":"twitter","url":"https://x.com/PNB_VE","handle":"@PNB_VE"}
]'::jsonb
WHERE name ILIKE '%Policía%' OR category = 'police';

UPDATE hospitals SET social_links = '[
  {"platform":"instagram","url":"https://www.instagram.com/minsalud_ve/","handle":"@minsalud_ve"},
  {"platform":"twitter","url":"https://x.com/minsalud_ve","handle":"@minsalud_ve"},
  {"platform":"facebook","url":"https://www.facebook.com/minsaludve","handle":"MinSalud VE"}
]'::jsonb;
