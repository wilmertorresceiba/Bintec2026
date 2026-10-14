# Análisis de Complejidad Técnica

**Fecha:** 2026-10-12

---

## Resultado

| | |
|---|---|
| **Complejidad Total** | **4/10** 🟡 MEDIA |

---

## Resumen por Dimensión

| Dimensión | Peso | Puntuación | Ponderado |
|-----------|------|------------|-----------|
| 🏗️ Arquitectura de Componentes | 30% | 3/10 | 0,9 |
| ☁️ Infraestructura | 20% | 2/10 | 0,4 |
| 🧱 Arquitectura Interna de Código | 30% | 7/10 | 2,1 |
| 🔌 Integraciones Externas | 20% | 1/10 | 0,2 |

---

## 🏗️ Arquitectura de Componentes (3/10)

**Justificación:** Es un monolito modular desplegado como 2 componentes (SPA Angular + API FastAPI) con una sola base de datos SQLite. No hay gateway, BFF, broker, colas ni comunicación por eventos. Los 8 módulos del backend se componen en un único proceso. La modularidad interna (capas domain/application/infrastructure/presentation) es limpia, pero no aporta complejidad distribuida.

**Detalle:** Hay 2 unidades desplegables: la SPA Angular 20 (features autenticacion, dashboard, inicio y producto) y la API FastAPI monolítica con SQLAlchemy 2 sobre SQLite. El backend es un monolito modular por bounded contexts con capas hexagonales/DDD por módulo, ensamblados en `main.py`. Hay una sola persistencia, sin polyglot. La comunicación es REST/HTTP directo desde la SPA a la API, e interna por llamadas en proceso. No hay CQRS, event sourcing ni event-driven. El módulo `dashboard` agrega datos de otros módulos dentro del mismo proceso; no es un BFF separado. *Limitación: no se abrió el código de cada módulo; la ausencia de integraciones externas se infiere de búsquedas de texto.*

**Evidencias:**
- `docs/backend/app/main.py`: una sola app FastAPI (`crear_app`) que incluye 8 routers (identidad, dashboard, cuentas, tarjetas, creditos, movimientos, analitica, notificaciones) bajo `/api`
- `docs/backend/app/main.py`: un solo engine/session_factory compartido por todos los módulos; seed al iniciar
- `docs/backend/database/bintec.db`: una única base SQLite
- Sin coincidencias de httpx, requests, celery, redis, pika, kafka, EventBus ni `publish(` en `docs/backend/app`
- `docs/frontend/proxy.conf.json`: `/api` → `localhost:8000`, único canal HTTP directo SPA → API (REST)
- Sin docker-compose, Kubernetes, Terraform ni brokers a nivel raíz
- Frontend Angular único (core/shared/layout/feature), no microfrontends
- CORS limitado a GET y POST; no hay API Gateway ni BFF

---

## ☁️ Infraestructura (2/10)

**Justificación:** Despliegue local sin containers, sin IaC, sin servicios cloud y sin observabilidad. Solo existe un Jenkinsfile básico para el frontend (CI sin CD) con análisis SonarQube, lo que sube un poco la puntuación sobre el mínimo.

**Detalle:** SPA Angular 20 + API FastAPI con SQLite local. No hay Dockerfile, docker-compose, Kubernetes, Terraform ni workflows de CI para el backend. El único pipeline es un Jenkinsfile de CI para el frontend (build, lint, tests unitarios y de componente, SonarQube), sin despliegue automatizado ni pipeline para el backend. Ambientes: local (proxy a localhost:8000) más archivos environment dev/prod del frontend, sin evidencia de staging ni servidores desplegados. Sin IaC ni servicios cloud. Observabilidad ausente: como máximo logging estándar de Python, sin monitoreo, tracing ni alertas más allá del correo en fallo de Jenkins.

**Evidencias:**
- `docs/frontend/Jenkinsfile` (stages: Checkout, Install, Build, Lint, Unit Test, Component Test, Static Code Analysis con `sonarqubeMasQualityGatesP`; agente `Slave_Induccion`; notificación por mail en fallo; sin etapa de deploy; proyecto Sonar `app-base` heredado de la plantilla)
- `docs/frontend/proxy.conf.json` (`/api` → `localhost:8000`)
- `docs/backend/database/bintec.db` (SQLite local)
- `docs/backend/.env.example` (variables `BINTEC_*`)
- `docs/frontend/src/environments/` (`environment.ts`, `environment.development.ts`: solo 2 ambientes de configuración del frontend)
- Búsqueda sin resultados de Dockerfile*, docker-compose*, *.tf y *.yml/*.yaml (workflows, k8s) en `docs/`
- Sin Sentry, Prometheus ni OpenTelemetry en el backend

---

## 🧱 Arquitectura Interna de Código (7/10)

**Justificación:** El backend sigue una arquitectura hexagonal modular real, con 8 módulos y capas domain/application/infrastructure/presentation. No hay imports de fastapi, sqlalchemy ni pydantic en domain ni application. Hay puertos, repository pattern, casos de uso con DI por constructor y errores de dominio centralizados. El DDD es táctico y ligero: entidades pequeñas, sin agregados complejos, domain events, CQRS ni event sourcing. Los tests son unitarios e integración con umbral de cobertura del 80 %. No llega a 8 por la ausencia de CQRS, eventos y contract tests, y por el acoplamiento entre módulos.

**Detalle:** *Backend:* monolito modular hexagonal con DDD táctico ligero. Cada módulo es un bounded context aproximado con puertos (ABC en `domain/repositories.py`), adaptadores SQLAlchemy y routers/schemas Pydantic en `presentation`. La regla de dependencias se cumple en las capas internas. Los adaptadores de seguridad (hash, tokens) se abstraen por puertos en `identidad/application/ports.py`. Existen dependencias cruzadas: `dashboard`, `analitica` y `notificaciones` importan dominio o aplicación de otros módulos (creditos, movimientos, tarjetas) directamente, sin anti-corruption layer ni contratos explícitos, lo que debilita el aislamiento de bounded contexts. Manejo de errores centralizado (custom exceptions + handler global), sin Result pattern. Testing: unitarios e integración (TestClient), cobertura ≥ 80 %, mypy strict y ruff; sin contract tests ni E2E del backend. *Frontend:* Angular 20 con capas core/shared/layout/feature, boundaries estrictos por ESLint, signals y OnPush, interceptores, guards y 35 specs Karma; sin store complejo (apropiado para el alcance). Los tests Cypress son de plantilla y no cubren el producto.

**Evidencias:**
- `docs/backend/app/modules/{identidad,cuentas,tarjetas,creditos,movimientos,notificaciones,analitica,dashboard}`: cada uno con domain/application/infrastructure/presentation (118 archivos .py)
- Sin imports de fastapi/sqlalchemy/pydantic en `domain/` ni `application/`
- Puertos y repositorios abstractos: `modules/*/domain/repositories.py`, `identidad/application/ports.py`; adaptadores en `infrastructure/repositorio_sqlalchemy.py` y `identidad/infrastructure/seguridad.py`
- Casos de uso como clases con `ejecutar()`, DI por constructor, reloj inyectable y DTOs `frozen dataclass`: `identidad/application/iniciar_sesion.py`, `verificar_segundo_factor.py`
- Entidades inmutables con comportamiento (`Usuario.registrar_fallo`, `esta_bloqueado`)
- `shared/errors.py`: jerarquía `DomainError`, código estable y handler global con `ESTADO_HTTP_POR_CODIGO`
- Dependencias cruzadas: dashboard → creditos/movimientos/tarjetas; analitica → movimientos; notificaciones → creditos; varios presentation → identidad
- `dashboard` y `analitica` son de solo lectura (consultas agregadas), sin CQRS formal ni bus de eventos
- `tests/unit` y `tests/integration` con `conftest.py`; `pyproject.toml` con `fail_under = 80` y `mypy strict = true`
- Frontend: `eslint-plugin-boundaries` (`configs.strict`), 35 `*.spec.ts`, sin NgRx; `cypress/e2e/producto/*` y `cypress/component/*` son de plantilla

---

## 🔌 Integraciones Externas (1/10)

**Justificación:** No hay integraciones reales con terceros. El backend no tiene clientes HTTP salientes, SDKs, colas, WebSockets, correo/SMS, pasarelas ni identity providers externos. La única integración es la interna frontend ↔ backend por REST vía `/api`. Los rastros externos son menores: un header `x-api-key` con valor de plantilla y una fuente de Google Fonts.

**Detalle:** Integración interna: SPA Angular → FastAPI por REST con proxy `/api` (localhost:8000), JWT HS256 propio, scrypt y segundo factor con código fijo de demo detrás de un puerto (sin proveedor SMS/TOTP externo). El módulo de notificaciones (oferta de crédito preaprobado) es interno, sin canal de entrega externo. Base de datos SQLite local. Sin mensajería, patrones de resiliencia (retry, circuit breaker, saga, outbox), ETL ni CDC.

**Evidencias:**
- `docs/backend`: sin resultados de requests/httpx/aiohttp/urllib/smtplib/twilio/sendgrid/boto3/websocket/kafka/rabbit/celery/redis en el código de la app (`httpx` solo en `requirements-dev.txt`, para tests)
- `docs/backend/app/shared/config.py`: `cors_origenes = ['http://localhost:4200']` (solo CORS hacia el propio frontend)
- `docs/frontend/src/app/core/interceptors/api-key/api-key.interceptor.ts`: fija `x-api-key: reqres-free-v1` (resto de plantilla; se envía a la API propia, no a un tercero)
- `docs/frontend/src/app/core/core.ts`: `provideHttpClient` con interceptores erroresHttp, autenticacion y apiKey
- `docs/frontend/src/styles.scss:13`: `@import` de `fonts.googleapis.com` (recurso estático, no integración de datos)
- `docs/frontend/src/app/feature/producto/mocks/builders/*`: URL `fakestoreapi.com` solo como dato de prueba
- Frontend sin `fetch()` ni WebSocket hacia terceros; el webchat es solo un cascarón visual

---

## Interpretación del Nivel

| Rango | Nivel | Descripción |
|-------|-------|-------------|
| 1-3 | 🟢 BAJA | Proyecto simple, equipo junior puede manejarlo |
| 4-6 | 🟡 MEDIA | Requiere experiencia técnica moderada |
| 7-8 | 🟠 ALTA | Requiere equipo senior con experiencia en arquitecturas complejas |
| 9-10 | 🔴 MUY ALTA | Requiere especialistas y governance técnico fuerte |

---

*Generado por: Project Manager Ceiba - Método Ceiba*

> **Método Ceiba analizar complejidad tecnica proyecto** v6.1.97 | Modelo: Claude Sonnet 5.5 | Usuario: Wilmer Giovanny Torres Achury | Fecha: 2026-10-12
