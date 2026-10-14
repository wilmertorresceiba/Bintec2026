# Bintec Banca en línea — Frontend (demo Bintec 2026)

Aplicación **Angular 20** de banca en línea para un taller: login y dashboard de un cliente con tarjetas de crédito y créditos. Consume el backend real de [`../backend`](../backend/README.md) (FastAPI + SQLite).

> Basada en la plantilla `app-angular-base` (arquitectura por capas, ESLint estricto, Karma/Jasmine y Cypress). **Se recomienda Node 20** por compatibilidad de las dependencias.

---

## Arranque rápido

> Atajo: `python ..\deploy\deploy.py iniciar` levanta backend y frontend en orden (ver [deploy/README.md](../deploy/README.md)).

1. **Backend** (en otra terminal), desde `../backend`:
   ```powershell
   .venv\Scripts\python -m uvicorn app.main:crear_app --factory --reload --port 8000
   ```
2. **Frontend**, desde esta carpeta:
   ```sh
   npm install
   npm start          # http://localhost:4200 (el proxy envía /api a http://localhost:8000)
   ```

**Cliente demo:** `wilmer.torres@ceiba.com.co` / `Demo2026*` · clave de cajero `1381` · código de seguridad `123456`. Cada paso del login tiene un botón "Autocompletar credenciales".

> Si el backend no está corriendo, el login muestra un error genérico y el proxy registra `ECONNREFUSED`. El proxy se configura en [`proxy.conf.json`](./proxy.conf.json).

---

## Qué incluye

| Pantalla | Ruta | Descripción |
|---|---|---|
| Login | `/login` | **Stepper de 3 pasos:** 1) correo y clave → 2) clave de cajero (4 dígitos) → 3) código de seguridad (6 dígitos). Sesión con JWT en `sessionStorage`. |
| Inicio | `/dashboard` | Resumen financiero y **gráficas de uso** de tarjetas por año, mes y día (clic en una barra para profundizar). |
| Cuentas de ahorro | `/dashboard/productos/cuentas` | Saldo disponible y total, rendimientos del mes y tasa E.A. |
| Tarjetas | `/dashboard/productos/tarjetas` | Cupo, pagos y fechas límite. |
| Créditos | `/dashboard/productos/creditos` | Saldo, cuotas y próximos pagos. |
| Reportes | `/dashboard/reportes` | Movimientos filtrables por fechas y tipo, con descarga **CSV**. |
| Crédito preaprobado | `/dashboard/oferta-credito/:id` | Condiciones de la oferta. **"Aceptar crédito" activa el webchat** (solo el cascarón, sin lógica todavía); "Rechazar oferta" no hace nada por ahora. |

Además, en el layout global:
- **Sidebar** plegable con submenú (Mis productos → Cuentas de ahorro / Tarjetas / Créditos) y cierre de sesión.
- **Header** con **miga de pan** (se arma desde `data: { miga: '...' }` en las rutas), **campanita de notificaciones** y **código de seguridad** rotativo.
- **Campanita:** muestra la oferta de crédito preaprobado y permanece activa hasta que se decida; "Ver detalle" lleva a la pantalla de la oferta.

---

## Estructura

La arquitectura está dividida en capas (ver [ARQUITECTURA.md](./guidelines/ARQUITECTURA.md); las reglas de dependencia las valida ESLint con *boundaries*):

```
src/app/
├── core/       # sesión, guards, interceptores, servicios singleton (sesion, notificaciones, miga-de-pan, http)
├── shared/     # componentes reutilizables: stepper, grafica-barras, barra-progreso, estado-datos, webchat,
│               #   campana-notificaciones, aviso-notificacion, codigo-seguridad, loading + utils (moneda, CSV)
├── layout/     # main-layout, navbar (sidebar) y header
└── feature/
    ├── autenticacion/   # login por pasos (paso-credenciales, paso-numerico)
    └── dashboard/       # inicio, cuentas de ahorro, tarjetas, créditos, reportes, oferta de crédito
```

Los features nunca se importan entre sí. `feature/producto` e `feature/inicio` son restos de la plantilla: ya no están enrutados.

---

## Login por pasos

El backend valida en dos pasos (`POST /auth/login` → desafío; `POST /auth/verificar` → sesión). El frontend lo presenta como un **stepper** de tres pasos: la clave de cajero se guarda solo en memoria y se envía junto con el código de seguridad en el último paso. Si el backend rechaza el segundo factor se vuelve al paso 2 con el mensaje; si el desafío expira o la cuenta se bloquea (3 intentos fallidos, 15 min) se vuelve al paso 1.

## Diseño, accesibilidad y responsive

- **Design tokens:** todo el color, radios y sombras salen de variables CSS en [`src/assets/scss/partials/_tokens.scss`](./src/assets/scss/partials/_tokens.scss). Para re-tematizar basta cambiar `--color-primario` (hoy amarillo `#fdda24`); hover, foco y variantes se derivan solos con `color-mix()`.
- **Responsive** validado en 320, 375, 768, 1024 y 1440 px: sin scroll horizontal, controles táctiles ≥ 44 px, gráfica que se adapta al ancho.
- **Accesibilidad:** HTML semántico, foco visible, navegación por teclado, regiones `aria-live`, `prefers-reduced-motion` respetado.
- **Formato:** moneda COP y locale `es-CO`.

---

## Comandos principales

```sh
npm start               # Servidor de desarrollo con proxy al backend
npm run build           # Build de producción
npm run lint            # ESLint (debe quedar en 0 errores)
npm run test:ci         # Pruebas unitarias (Karma/Jasmine, Chrome headless) con cobertura
npm run format:write    # Prettier
npm run analyze         # Análisis visual del bundle
```

Estado de calidad: **pruebas unitarias en verde** (Karma/Jasmine), lint sin errores y build de producción correcto.

Las pruebas Cypress (`npm run cypress`, `npm run e2e`) provienen de la plantilla y cubren el feature `producto`, que ya no está enrutado; no se mantienen para esta demo.

---

## Documentación técnica y guías

- **Arquitectura y capas:** [ARQUITECTURA.md](./guidelines/ARQUITECTURA.md)
- **Dependencias y scripts:** [DEPENDENCIAS.md](./guidelines/DEPENDENCIAS.md)
- **Reglas de ESLint:** [ESLINT-RULES.md](./guidelines/ESLINT-RULES.md)
- **Prettier (formateo de código):** [PRETTIER.md](./guidelines/PRETTIER.md)
- **Boundaries (reglas de arquitectura):** [BOUNDARIES.md](./guidelines/BOUNDARIES.md)
- **Orden de imports:** [IMPORT-ORDER.md](./guidelines/IMPORT-ORDER.md)

Convenciones del proyecto: tipos explícitos en todo, sin números "mágicos" (usar constantes, p. ej. `CERO`/`UNO` de `shared/utils/numeros`), componentes standalone con `OnPush` y signals, plantillas con `@if`/`@for`.

---

## Pruebas de componente

Se utilizan ComponentObject (`*.co.ts`), similar a PageObject, para separar la lógica de interacción y selección de elementos de los escenarios de prueba, mejorando la mantenibilidad y legibilidad de los tests.

---

## Pendiente

- **Webchat:** hoy es solo el cascarón visual. Falta el backend de conversaciones (ver el README del backend) y la lógica del proceso de aprobación.
- **"Rechazar oferta"** aún no tiene comportamiento.
