from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.modules.creditos.application.listar_creditos import ListarCreditos
from app.modules.creditos.infrastructure.repositorio_sqlalchemy import (
    CreditoRepositorioSqlAlchemy,
)
from app.modules.dashboard.application.obtener_dashboard import ObtenerDashboard
from app.modules.movimientos.application.listar_movimientos import ListarMovimientos
from app.modules.movimientos.infrastructure.repositorio_sqlalchemy import (
    MovimientoRepositorioSqlAlchemy,
)
from app.modules.tarjetas.application.listar_tarjetas import ListarTarjetas
from app.modules.tarjetas.infrastructure.repositorio_sqlalchemy import (
    TarjetaRepositorioSqlAlchemy,
)
from app.shared.dependencies import get_session


def obtener_dashboard(session: Annotated[Session, Depends(get_session)]) -> ObtenerDashboard:
    return ObtenerDashboard(
        ListarTarjetas(TarjetaRepositorioSqlAlchemy(session)),
        ListarCreditos(CreditoRepositorioSqlAlchemy(session)),
        ListarMovimientos(MovimientoRepositorioSqlAlchemy(session)),
    )
