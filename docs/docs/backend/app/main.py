"""Raíz de composición de la API Bintec Banca.

Ejecutar:  uvicorn app.main:crear_app --factory --reload --port 8000
"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.modules.analitica.presentation.router import router as analitica_router
from app.modules.creditos.presentation.router import router as creditos_router
from app.modules.cuentas.presentation.router import router as cuentas_router
from app.modules.dashboard.presentation.router import router as dashboard_router
from app.modules.identidad.presentation.router import router as identidad_router
from app.modules.movimientos.presentation.router import router as movimientos_router
from app.modules.notificaciones.presentation.router import router as notificaciones_router
from app.modules.tarjetas.presentation.router import router as tarjetas_router
from app.seed import preparar_base_de_datos
from app.shared.config import Settings, get_settings
from app.shared.database import crear_engine, crear_session_factory
from app.shared.errors import registrar_manejadores

PREFIJO_API: str = "/api"


def crear_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    engine = crear_engine(settings.database_url)
    session_factory = crear_session_factory(engine)

    @asynccontextmanager
    async def ciclo_de_vida(_: FastAPI) -> AsyncIterator[None]:
        preparar_base_de_datos(engine, session_factory, settings.sembrar_al_iniciar)
        yield
        engine.dispose()

    app = FastAPI(title="Bintec Banca API", version="1.0.0", lifespan=ciclo_de_vida)
    app.state.settings = settings
    app.state.session_factory = session_factory

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origenes,
        allow_methods=["GET", "POST"],
        allow_headers=["Authorization", "Content-Type"],
    )
    registrar_manejadores(app)

    api = APIRouter(prefix=PREFIJO_API)
    for router in (
        identidad_router,
        dashboard_router,
        cuentas_router,
        tarjetas_router,
        creditos_router,
        movimientos_router,
        analitica_router,
        notificaciones_router,
    ):
        api.include_router(router)

    @api.get("/salud", tags=["Sistema"])
    def salud() -> dict[str, str]:
        return {"estado": "ok"}

    app.include_router(api)
    return app
