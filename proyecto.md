Quiero desarrollar una plataforma web moderna llamada "StartupVen Responde" (nombre temporal), creada por StartupVen.

El objetivo NO es hacer una página informativa, sino desarrollar una plataforma que centralice toda la información útil durante emergencias nacionales (terremotos, inundaciones, incendios, deslaves, huracanes, etc.).

Primero debes investigar en Internet el terremoto ocurrido en Venezuela el 24 de junio de 2026 y analizar cómo están organizando actualmente la ayuda los organismos oficiales, ONG, universidades, empresas y comunidades.

También debes investigar:

- páginas existentes para registrar desaparecidos
- páginas para mascotas perdidas
- centros de acopio
- refugios
- organizaciones de rescate
- Protección Civil
- Cruz Roja
- Bomberos
- organismos oficiales
- números de emergencia
- noticias verificadas
- cualquier plataforma creada después del terremoto

NO quiero duplicar herramientas existentes.

Quiero que la plataforma sirva como HUB CENTRAL que reúna toda esa información.

Debe permitir que un ciudadano entre y encuentre rápidamente toda la ayuda disponible.

Debe tener una interfaz moderna, rápida, responsive y preparada para dispositivos móviles.

Tecnologías:

- Next.js
- React
- TypeScript
- TailwindCSS
- Shadcn/UI
- Lucide Icons
- Supabase como backend
- PostgreSQL
- OpenStreetMap (Leaflet o MapLibre)

La aplicación debe estar preparada para crecer.

No desarrollar únicamente una landing.

Debe tener arquitectura modular.

Módulos iniciales:

1. Inicio

- Resumen de la situación.
- Banner principal.
- Accesos rápidos.

2. Centros de ayuda

Mapa.

Listado.

Filtros.

Horario.

Contacto.

Cómo llegar.

3. Hospitales

Estado operativo.

Información.

Mapa.

4. Refugios

Mapa.

Servicios disponibles.

Capacidad (si existe información).

5. Organismos oficiales

Protección Civil

Bomberos

Cruz Roja

Policía

Gobernaciones

Alcaldías

Con enlaces oficiales.

6. Personas desaparecidas

NO crear una nueva base de datos.

Simplemente centralizar los enlaces existentes y, si existe API pública, integrarla.

7. Mascotas perdidas

Igual que desaparecidos.

8. Noticias verificadas

Solo información proveniente de organismos oficiales o medios confiables.

9. Registro de voluntarios

Formulario:

Nombre

Ciudad

Estado

Profesión

Especialidad

Vehículo

Disponibilidad

Teléfono

Correo

Ubicación

10. Empresas solidarias

Formulario para empresas que ofrecen:

agua

alimentos

combustible

transporte

internet

medicinas

maquinaria

alojamiento

11. Recursos

Guías de emergencia.

Qué hacer antes.

Durante.

Después.

Documentos descargables.

La aplicación debe usar Supabase para:

- autenticación
- base de datos
- almacenamiento
- realtime

Diseña una estructura limpia de tablas.

Implementa Row Level Security.

Crear panel administrativo.

Roles:

Administrador

Editor

Voluntario

Solo el administrador podrá publicar información.

También quiero que la aplicación tenga un diseño premium, muy moderno, estilo Stripe, Linear, Vercel, Notion o Apple.

Debe transmitir confianza.

No usar colores agresivos.

Priorizar accesibilidad.

Usar buenas prácticas SEO.

Implementar PWA.

Optimizar rendimiento.

Preparar toda la arquitectura para que en el futuro pueda añadirse:

- notificaciones push
- app móvil Flutter
- mapa colaborativo
- IA para clasificación de reportes
- solicitudes de ayuda
- panel para Protección Civil
- integración con WhatsApp
- modo offline
- múltiples países

Antes de comenzar el desarrollo analiza el problema, propón mejoras funcionales y diseña una arquitectura escalable. Si durante la investigación encuentras funcionalidades más útiles que las descritas, inclúyelas justificando su valor.