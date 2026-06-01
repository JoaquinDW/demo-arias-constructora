# Guía de Inicio — Sosa Motos

Credenciales admin del panel: **usuario** `sosamotos` / **contraseña** `SosaMotos2025!`

---

## 1. Supabase — Base de datos

### 1.1 Crear el proyecto

1. Ir a [supabase.com](https://supabase.com) → **New project**
2. Elegir nombre: `sosa-motos-sorteos`
3. Elegir región: **South America (São Paulo)**
4. Guardar la contraseña de la base de datos en un lugar seguro
5. Esperar que el proyecto termine de crearse (~2 min)

### 1.2 Obtener las credenciales

En el dashboard de Supabase: **Project Settings → API**

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Pegar ambos valores en `.env.local`.

### 1.3 Aplicar las migraciones (en orden)

En Supabase: **SQL Editor** → pegar y ejecutar cada archivo de `scripts/` en este orden:

```
01-create-tables.sql
02-add-image-field.sql
03-add-sorteo-states.sql
04-trigger-validacion-duplicados.sql   ← crítico: previene duplicados
05-add-transferencia-fields.sql
06-add-pack-quantities.sql
07-add-titulo-remera.sql
08-setup-supabase-storage.sql
09-migrate-existing-images.sql
10-add-carousel-images.sql
11-add-carousel-images-4-to-8.sql
12-add-instagram-optional-email.sql
13-add-mostrar-packs-field.sql
14-add-pack-descriptions.sql
15-add-ganadores-pasados.sql
16-add-ganadores-express.sql
17-add-optimized-functions.sql         ← crítico: atomicidad y stats
18-fix-for-update-error.sql
19-add-configuracion.sql
20-add-ganador-nombre.sql
```

> **Importante:** el script `17` es el más crítico — contiene las funciones SQL que garantizan que dos compradores no obtengan el mismo número aunque compren al mismo tiempo.

---

## 2. MercadoPago

1. Ir a [mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers/panel/app)
2. Crear una nueva aplicación
3. En **Credenciales de prueba** (para testear):
   - `Access Token` → `MERCADOPAGO_ACCESS_TOKEN`
   - `Public Key` → `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
4. Cuando estén listos para cobrar de verdad, reemplazar con las **Credenciales de producción**

### Webhook de pagos

En el panel de MercadoPago → **Webhooks** → agregar:

```
https://TU-DOMINIO.vercel.app/api/confirmar-pago
```

Tipo: **Pagos** (payment)

---

## 3. Resend — Emails de confirmación

1. Ir a [resend.com](https://resend.com) → crear cuenta
2. **API Keys** → crear una clave
3. Pegar en `.env.local` como `RESEND_API_KEY`

> Por ahora los emails salen desde `onboarding@resend.dev` (dominio de prueba de Resend). Para usar `@sosamotos.com.ar` hay que verificar el dominio en Resend → **Domains**.

---

## 4. Vercel — Deploy y almacenamiento de imágenes

### 4.1 Deploy

1. Subir el proyecto a GitHub
2. En [vercel.com](https://vercel.com) → **New Project** → importar el repo
3. En **Environment Variables** cargar todas las variables de `.env.local`
4. El dominio inicial será algo como `sosa-motos.vercel.app`

### 4.2 Vercel Blob (imágenes)

1. En el dashboard de Vercel → **Storage** → **Create Database** → **Blob**
2. Conectar al proyecto
3. El token `BLOB_READ_WRITE_TOKEN` se agrega automáticamente a las env vars del proyecto
4. También agregarlo en `.env.local` para desarrollo local

### 4.3 Cron job (sorteo automático)

El archivo `vercel.json` ya tiene configurado el cron:

```json
"0 14 * * *"  →  todos los días a las 14:00 UTC (11:00 Argentina)
```

Llama a `/api/verificar-sorteos` con el header `Authorization: Bearer CRON_SECRET`. Vercel lo ejecuta automáticamente en el plan gratuito (Hobby).

---

## 5. Configuración inicial desde el Backoffice

Entrá a `/backoffice` con `sosamotos` / `SosaMotos2025!` y configurá:

### Cuenta de transferencia bancaria
En **Configuración → Cuenta de transferencia**:
- **Alias**: tu alias de Mercado Pago (ej: `agustin.sosa.mp`)
- **Titular**: nombre completo tal como aparece en la cuenta

### Crear el primer sorteo
En **Gestionar Sorteo → Crear sorteo**:
- Nombre del sorteo
- Total de chances
- Precios de los packs
- Descripción de cada pack
- Imagen principal y carrusel (hasta 8 fotos)

### Alias de transferencia visible al comprador
Los datos de la cuenta de transferencia que cargues en el backoffice son lo que ven los compradores cuando eligen pagar por transferencia. Actualizarlos antes de hacer pública la página.

---

## 6. Variables de entorno — resumen

| Variable | Dónde conseguirla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_APP_URL` | URL de Vercel (o dominio propio) |
| `MERCADOPAGO_ACCESS_TOKEN` | MercadoPago Developers |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | MercadoPago Developers |
| `RESEND_API_KEY` | resend.com → API Keys |
| `BLOB_READ_WRITE_TOKEN` | Vercel → Storage → Blob |
| `CRON_SECRET` | Inventar un string aleatorio |

---

## 7. Comandos útiles (desarrollo local)

```bash
pnpm dev                    # Servidor de desarrollo en localhost:3000
pnpm build                  # Build de producción
pnpm run prueba-rapida      # Smoke test contra la base de datos
pnpm run verificar-sorteos  # Correr manualmente la verificación de sorteos
```

---

## 8. Contacto del desarrollador

Si hay dudas técnicas: [De Weert Studio](https://linktr.ee/deweertstudio)
