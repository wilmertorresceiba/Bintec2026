# deploy — iniciar y detener la demo Bintec

Pequeño proyecto en **Python** (solo biblioteca estándar, sin instalar nada) que arranca, reinicia y detiene el
[backend](../backend/README.md) (FastAPI + SQLite) y el [frontend](../frontend/readme.md) (Angular) con un único comando:
`deploy.py`.

Requisitos: Python 3.10+ y, para el frontend, Node 20+ (`npm`/`npx` en el PATH).

## Uso

```powershell
cd D:\Documents\Bintec-2026\docs\deploy

python deploy.py backend      # inicia SOLO el backend
python deploy.py frontend     # inicia SOLO el frontend
python deploy.py iniciar      # inicia el backend y, cuando responde, el frontend
python deploy.py reiniciar    # detiene todo y lo vuelve a iniciar (en orden)
python deploy.py detener      # detiene todo
python deploy.py estado       # qué está corriendo (PID, puerto, URL)
python deploy.py logs backend -n 50
```

| Comando | Qué hace |
|---|---|
| `backend` | Inicia solo el backend y espera a que `/api/salud` responda. |
| `frontend` | Inicia solo el frontend (`ng serve` con el proxy al backend). Avisa si el backend no está activo. |
| `iniciar` (`start`) | Backend → espera a que esté sano → frontend. Si el backend falla, **no** arranca el frontend. |
| `reiniciar` (`restart`) `[backend\|frontend\|todo]` | Detiene y vuelve a iniciar. Por defecto, todo. |
| `detener` (`stop`) `[backend\|frontend\|todo]` | Cierra los procesos (primero el frontend, luego el backend). Por defecto, todo. |
| `estado` (`status`) | Tabla con `corriendo`, `iniciando / sin respuesta`, `en uso (externo)` o `detenido`. |
| `logs <servicio> -n N` | Últimas N líneas del log. |

Opciones: `--abrir` (abre el navegador al iniciar el frontend), `--sin-preparar` (no crear el entorno virtual ni
ejecutar `npm install`) y `--forzar` (ver abajo).

Resultado esperado tras `iniciar`:

- Backend: <http://127.0.0.1:8000> (documentación en `/docs`)
- Frontend: <http://localhost:4200>
- Cliente demo: `wilmer.torres@ceiba.com.co` / `Demo2026*` · clave de cajero `1381` · código de seguridad `123456`

## Cómo funciona

- Cada servicio se lanza **en segundo plano** (sin ventana, en su propio grupo de procesos), por lo que sigue corriendo
  aunque cierres la terminal. Su salida va a `logs/<servicio>.log`.
- El PID se guarda en `.run/<servicio>.json`; así `detener` cierra **todo el árbol de procesos** que lanzó
  (en Windows con `taskkill /T /F`; en Linux/macOS con señales a todo el grupo).
- En el primer arranque prepara lo que falte: crea `backend/.venv` e instala `requirements.txt`, o ejecuta
  `npm install` en el frontend. La primera compilación de Angular puede tardar un par de minutos.
- Es **idempotente**: si el servicio ya corre y responde, no lo lanza otra vez.

### Procesos ajenos y `--forzar`

Si un puerto está ocupado por algo que **no inició `deploy.py`** (por ejemplo, un `npm start` abierto a mano),
el programa **no lo toca**: lo informa con su PID y termina con error. Con `--forzar` sí lo cierra y toma el puerto.

```powershell
python deploy.py frontend --forzar     # libera el 4200 si lo ocupa otro proceso y arranca el frontend
python deploy.py detener --forzar      # además cierra lo que siga usando los puertos 8000/4200
```

## Configuración

Valores por defecto y variables de entorno opcionales (prefijo `BINTEC_DEPLOY_`):

| Variable | Defecto |
|---|---|
| `BACKEND_DIR` | `../backend` |
| `FRONTEND_DIR` | `../frontend` |
| `BACKEND_PUERTO` | `8000` |
| `FRONTEND_PUERTO` | `4200` |

```powershell
$env:BINTEC_DEPLOY_BACKEND_PUERTO = "8100"; $env:BINTEC_DEPLOY_FRONTEND_PUERTO = "4300"
python deploy.py iniciar     # levanta ambos en puertos alternativos
```

> Si cambias el puerto del backend, ajusta también `frontend/proxy.conf.json` (apunta a `localhost:8000`).

## Estructura

```
deploy/
├── deploy.py                # punto de entrada
├── bintec_deploy/
│   ├── cli.py               # comandos y opciones (argparse)
│   ├── orquestador.py       # iniciar / detener / reiniciar / estado / logs (lógica pura)
│   ├── servicios.py         # comandos de arranque y preparación de cada servicio
│   ├── sistema.py           # TODO lo que toca el SO: procesos, puertos, salud HTTP
│   ├── registro.py          # PIDs en .run/
│   ├── config.py            # rutas, puertos y timeouts
│   └── consola.py           # salida [ok] [..] [!!] [xx]
├── tests/                   # 41 tests con un sistema falso (no lanzan procesos reales)
├── logs/  .run/             # generados en tiempo de ejecución (ignorados por git)
```

## Pruebas y calidad

```powershell
..\backend\.venv\Scripts\python -m pytest tests      # 41 tests
..\backend\.venv\Scripts\python -m ruff check .
..\backend\.venv\Scripts\python -m mypy bintec_deploy --strict --ignore-missing-imports
```

## Solución de problemas

- **"El puerto … ya está en uso"** → hay otro proceso; ciérralo o usa `--forzar`.
- **"se cerró al arrancar"** → el programa imprime las últimas líneas del log; para más: `python deploy.py logs backend -n 100`.
- **El frontend no responde en 3 minutos** → revisa `logs/frontend.log` (errores de compilación de Angular).
- **Login con error genérico** → el backend no está activo: `python deploy.py estado`.
