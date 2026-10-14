# Bintec Banca API

Backend real del frontend [`../frontend`](../frontend/readme.md): login, dashboard de un cliente bancario (tarjetas de crédito, créditos, movimientos), analítica de consumo, reportes y notificaciones con una oferta de crédito preaprobado.
**FastAPI + SQLAlchemy 2 + SQLite**, arquitectura hexagonal y modular por dominio (DDD).

## Arranque rápido

> Atajo: `python ..\deploy\deploy.py iniciar` levanta backend y frontend (ver [deploy/README.md](../deploy/README.md)).

```powershell
cd D:\Documents\Bintec-2026\docs\backend
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements-dev.txt
.venv\Scripts\python -m uvicorn app.main:crear_app --factory --reload --port 8000
```

- Documentación interactiva: <http://localhost:8000/docs>
- La primera vez crea `database/bintec.db` y siembra el cliente demo con 3 años de historial de consumo (si la base está vacía).
- Reiniciar los datos demo: `.venv\Scripts\python -m app.seed --reset`
- Frontend: `cd ..\frontend && npm start` (el proxy `/api` apunta a `http://localhost:8000`).

**Cliente demo:** `wilmer.torres@ceiba.com.co` / `Demo2026*` · clave de cajero `1381` · código de seguridad `123456`

## API

Todas las rutas cuelgan de `/api`. Excepto `login` y `salud`, exigen `Authorization: Bearer <token>`.

| Método | Ruta              | Descripción                                                    |
|--------|-------------------|----------------------------------------------------------------|
| POST   | `/auth/login`     | **Paso 1.** `{correo, clave}` → `{desafio, requiereSegundoFactor}` (aún sin sesión) |
| POST   | `/auth/verificar` | **Paso 2.** `{desafio, claveCajero(4 dígitos), codigoSeguridad(6 dígitos)}` → `{token, usuario}` |
| GET    | `/auth/me`        | Usuario de la sesión                                           |
| GET    | `/dashboard`      | Resumen + tarjetas + créditos + 6 últimos movimientos          |
| GET    | `/cuentas`        | Cuentas de ahorro del cliente (saldos, rendimientos, tasa E.A.) |
| GET    | `/tarjetas`       | Tarjetas de crédito del cliente                                |
| GET    | `/creditos`       | Créditos del cliente                                           |
| GET    | `/movimientos`    | Movimientos recientes (`?limite=1..100`, por defecto 20)       |
| GET    | `/movimientos/reporte` | Reporte filtrable: `?desde=&hasta=&tipo=&limite=` (fechas YYYY-MM-DD inclusivas) |
| GET    | `/notificaciones` | Notificaciones **activas** (crédito preaprobado): permanecen hasta que se decide |
| GET    | `/notificaciones/{id}` | Detalle; para el crédito preaprobado incluye condiciones (monto, cuotas, tasa, cuota, total, primera cuota) |
| POST   | `/notificaciones/{id}/aceptar` | Acepta la oferta: crea el crédito de libre inversión (una sola vez, 409 si ya se resolvió). **Hoy la interfaz no lo usa**: "Aceptar crédito" activa el webchat |
| POST   | `/notificaciones/{id}/rechazar` | Rechaza la oferta: no crea crédito (una sola vez). La interfaz aún no lo usa |
| GET    | `/analitica/consumo` | Consumo con tarjetas: `?periodo=anio\|mes\|dia&anio=&mes=` (gráficas de uso) |
| GET    | `/salud`          | Estado del servicio                                            |

El JSON usa **camelCase** y coincide con las interfaces TypeScript de `frontend/src/app/feature/dashboard`.
Los errores de negocio responden `{ "detail": "...", "code": "..." }` (401 credenciales/segundo factor/token, 404, 409 oferta ya resuelta, 422 validación, 423 cuenta bloqueada).

## Arquitectura

```
app/
├── main.py                  # raíz de composición (crear_app)
├── seed.py                  # datos demo + creación del esquema
├── shared/                  # kernel compartido: config, database, errores, esquemas, tiempo, EstadoProducto
└── modules/                 # un módulo por dominio
    ├── identidad/           # usuarios, login, JWT, scrypt
    ├── cuentas/             # cuentas de ahorro
    ├── tarjetas/            # tarjetas de crédito
    ├── creditos/            # créditos
    ├── movimientos/         # movimientos y reportes
    ├── notificaciones/      # avisos al cliente (campanita)
    ├── analitica/           # consumo por año, mes y día (modelo de lectura)
    └── dashboard/           # compone los demás (resumen financiero)
        ├── domain/          # entidades, reglas e interfaces (puertos) — sin frameworks
        ├── application/     # casos de uso
        ├── infrastructure/  # modelos SQLAlchemy y repositorios (adaptadores)
        └── presentation/    # routers FastAPI, esquemas Pydantic, dependencias
```

Reglas de dependencia: `presentation → application → domain` e `infrastructure → domain`.
`domain` y `application` no importan FastAPI ni SQLAlchemy. Cada módulo se cablea en su `presentation/dependencies.py`.

### Reglas de negocio (dominio)
- Cuenta de ahorros: saldos ≥ 0, `saldo disponible ≤ saldo total` (la diferencia es saldo retenido), tasa ≥ 0, 4 últimos dígitos.
- Tarjeta: cupo total > 0, `0 ≤ cupo utilizado ≤ cupo total`, pagos ≥ 0, 4 últimos dígitos.
- Crédito: `0 ≤ cuotas pagadas ≤ cuotas totales`, `0 ≤ saldo ≤ monto original`, cuota > 0.
- Resumen: deuda = cupo utilizado + saldos a capital; pago mensual = pagos mínimos + cuotas; próximo vencimiento = fecha más cercana.

### Seguridad
- **Login en dos pasos:** el paso 1 (correo y clave) solo entrega un *desafío* de 5 min; la sesión se emite únicamente tras validar la **clave de cajero** y el **código de seguridad**. El desafío lleva la claim `typ=desafio`, por lo que **no sirve como token de acceso** (y viceversa).
- **Bloqueo por intentos:** 3 fallos (en cualquiera de los dos pasos) bloquean la cuenta 15 min (HTTP 423, `cuenta_bloqueada`); un acierto reinicia el contador. Los límites son configurables (`BINTEC_MAX_INTENTOS_FALLIDOS`, `BINTEC_MINUTOS_BLOQUEO`).
- El segundo factor responde el mismo error aunque falle solo uno de los datos (no se revela cuál). La clave de cajero se guarda con scrypt + sal.
- **Demo:** el código de seguridad es fijo (`BINTEC_CODIGO_SEGURIDAD_DEMO`, por defecto `123456`). En producción se reemplazaría por un OTP dinámico (TOTP/SMS) implementando el puerto `VerificadorCodigoSeguridad`, sin tocar el caso de uso.
- Claves con **scrypt** + sal aleatoria; JWT HS256 con expiración (60 min por defecto).
- Mismo error para correo inexistente y clave incorrecta (no se enumeran usuarios).
- **Anti-BOLA/IDOR**: toda consulta se acota al `usuario_id` del token; no hay IDs de usuario en las rutas.
- CORS restringido a `BINTEC_CORS_ORIGENES`. Cambia `BINTEC_JWT_SECRET` fuera de la demo (ver `.env.example`).
- Pendiente para producción: límite de intentos de login (rate limiting), rotación/revocación de tokens, HTTPS.

## Base de datos

SQLite en `database/bintec.db` (esquema documentado en `database/schema.sql`). Tablas: `usuarios`,
`cuentas_ahorro`, `tarjetas_credito`, `creditos`, `movimientos` y `notificaciones`, con llaves foráneas activas.

El esquema se crea con `Base.metadata.create_all` al iniciar; no hay migraciones Alembic porque es una demo.
`create_all` solo crea las tablas que faltan: si cambia una tabla existente, hay que correr
`python -m app.seed --reset` (borra y vuelve a sembrar los datos demo).

## Pendiente (siguiente etapa)

- **Conversaciones / webchat:** módulo `conversaciones` (conversación ligada al cliente y a la oferta, mensajes en SQLite, motor de conversación intercambiable). Transporte recomendado para empezar: REST; WebSocket cuando se necesiten respuestas en vivo (requiere `ws: true` en el proxy de Angular, autenticación del socket en el primer mensaje y límites de tamaño/frecuencia).
- Estado "en proceso" de la oferta: al integrar el chat, aceptar pasará a significar *iniciar la solicitud* y el crédito se creará al terminar la aprobación.
- Producción: rate limiting de login, revocación de tokens, HTTPS, auditoría y retención de conversaciones.

## Calidad
```powershell
.venv\Scripts\python -m pytest          # 85 tests, cobertura > 80 % exigida
.venv\Scripts\python -m ruff check app tests
.venv\Scripts\python -m mypy            # strict
```
