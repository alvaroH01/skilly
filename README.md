# Skilly LATAM

Plataforma web transaccional y curada que conecta a organizaciones (PyMEs, startups) con profesionales independientes. Proyecto de la asignatura **Proyecto Integrado** (INACAP).

- **Sitio en producción:** https://skilly-mocha.vercel.app
- **Repositorio:** https://github.com/alvaroH01/skilly
- **Equipo:** Álvaro Herrera, Valentín Robledo, Fernanda Cabezas
- **Docente:** Teresa Jesús Tapia Soto

## Qué hace

Skilly no es un marketplace abierto: Skilly valida antes de publicar y antes de cobrar.

1. El **Profesional** publica un **servicio** (título, descripción, precio y duración) y lo envía a revisión.
2. El **Administrador** de Skilly lo revisa: lo aprueba, pide cambios o propone un precio. Solo los servicios validados aparecen en el catálogo (`/buscar`).
3. El **Contratador** (en la base de datos, `cliente`) elige un servicio del catálogo y lo contrata con una fecha de inicio.
4. El Administrador genera una **orden de pago** con un enlace seguro de 24 horas.
5. El Contratador paga desde ese enlace. Al confirmarse el pago, la contratación pasa a **en ejecución** y ambas partes reciben una notificación.
6. Al terminar, el Contratador envía una **evaluación privada** (sin estrellas públicas; la lee solo el administrador). Si hay problemas, cualquiera de las partes reporta una **incidencia** y Skilly media.

Los cambios de estado críticos los valida la base de datos (funciones, triggers y políticas RLS), no el navegador.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.3.2 (App Router), React 19, TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos y autenticación | Supabase (PostgreSQL, Auth, Row Level Security) |
| Despliegue | Vercel |
| Calidad de código | ESLint, SonarQube |

## Requisitos

- Node.js 20 o superior
- npm
- Un proyecto de Supabase (gratuito sirve)

## Instalación

```bash
git clone https://github.com/alvaroH01/skilly.git
cd skilly
npm install
cp .env.example .env.local      # luego completa los valores (ver más abajo)
npm run dev
```

Abre http://localhost:3000.

### Variables de entorno

Se definen en `.env.local` (este archivo no se sube al repositorio).

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase (Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública (publishable / anon) del mismo proyecto |

Solo se usa la clave **pública**. Nunca se debe poner en el código la clave `service_role`.

## Base de datos

Los scripts están en la carpeta [`database/`](database/). Se ejecutan en el **SQL Editor de Supabase**, en este orden:

| Orden | Archivo | Qué hace |
|---|---|---|
| 1 | `01_crear_tablas.sql` | Crea las tablas con tipos, valores por defecto y restricciones |
| 2 | `02_llaves_primarias.sql` | Agrega las llaves primarias |
| 3 | `03_llaves_foraneas.sql` | Agrega las llaves foráneas |
| 4 | `06_indices.sql` | Crea los índices |
| 5 | `07_propuesta_correcciones.sql` | Políticas RLS, triggers de protección y funciones del flujo base |
| 6 | `09_catalogo_servicios.sql` | Catálogo de servicios, revisión por el administrador y función `contratar_servicio` |
| 7 | `10_cerrar_flujo_antiguo_y_enlace_pago.sql` | Cierra el flujo anterior, restringe los estados que puede cambiar el Contratador y agrega el enlace de pago |
| 8 | `11_evaluaciones_privadas_jsonb.sql` | Evaluaciones privadas como documento JSONB con índice GIN y lectura solo para el administrador |

Scripts de limpieza (solo para reiniciar un entorno de pruebas, **borran datos**):

- `04_drop_llaves_foraneas.sql`
- `05_drop_tablas.sql`

Los scripts 07 y 09 a 11 corren dentro de una transacción: si falla, no queda nada a medias. Pruébalo primero en un proyecto de Supabase de prueba.

### Crear la cuenta de administrador

Nadie puede asignarse el rol `admin` desde la aplicación (lo bloquea un trigger). Regístrate normalmente y luego, en el SQL Editor de Supabase:

```sql
update public.profiles set role = 'admin' where email = 'tu-correo@ejemplo.com';
```

## Roles

| Rol | Qué puede hacer |
|---|---|
| `cliente` | Publicar proyectos, seleccionar propuestas, pagar, evaluar y reportar incidencias |
| `profesional` | Explorar proyectos validados, postular, aceptar la tarifa sugerida, agendar entrevista |
| `ambos` | Las dos cosas anteriores con la misma cuenta |
| `admin` | Validar proyectos, curaduría de propuestas, generar órdenes de pago, mediar incidencias |

## Pagos (modo simulado)

El pago funciona con un flujo **simulado** (sandbox) que imita Webpay:

- El administrador genera la orden desde `/api/payments/create`. El token se genera con `crypto.randomBytes(32)`; en la base de datos solo se guarda su hash SHA-256, con vencimiento de 24 horas.
- El cliente abre `/pago/[token]` y confirma el pago. El código de autorización es de la forma `SBX-######`.
- La integración real con Transbank (ambiente de integración) queda como etapa futura.

## Estructura del proyecto

```
app/
  api/payments/      endpoints de creación y confirmación de pagos
  buscar/            catálogo público de servicios validados
  dashboard/         paneles por rol (cliente, profesional, admin)
  login, registro, onboarding, verificar-correo, auth/
  pago/[token]/      pantalla de pago con enlace seguro
components/          componentes por módulo (admin, client, professional, payment, incidents)
utils/supabase/      clientes de Supabase para navegador y servidor
database/            scripts SQL del modelo físico
```

## Scripts de npm

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm start` | Servidor de producción (después de `build`) |
| `npm run lint` | Revisión con ESLint |
| `npm test` | 22 pruebas unitarias (`tests/unit`, ejecutor `node:test` de Node, sin dependencias) |

## Estado actual y limitaciones conocidas

- Pago simulado; no hay conciliación con una pasarela real.
- Las evaluaciones privadas ya tienen su propia tabla (JSONB, solo lectura del administrador). Las incidencias y dictámenes siguen guardándose como texto en la descripción de la contratación; está planificada una tabla propia.
- La agenda de entrevistas de validación no se guarda en una tabla.
- La interfaz de carga y revisión de documentos del profesional está pendiente (la tabla ya existe).
- Faltan pruebas de rendimiento (JMeter) y de usabilidad con evaluadores externos.

## Colaboración

Nadie sube directamente a `main`. Cada cambio se hace en una rama (`feat/…`, `fix/…`, `docs/…`), se envía con un Pull Request y lo revisa otro integrante antes de fusionarlo. Antes de abrir el Pull Request se ejecutan `npm test`, `npx tsc --noEmit` y `npm run lint`. La guía completa está en el anexo «Guía de GitHub y del Entorno de Desarrollo» del informe.

## Despliegue

El proyecto se despliega en Vercel desde la rama `main`. En Vercel se deben definir las mismas variables de entorno de la sección anterior.
