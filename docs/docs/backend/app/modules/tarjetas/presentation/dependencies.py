from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.modules.tarjetas.application.listar_tarjetas import ListarTarjetas
from app.modules.tarjetas.infrastructure.repositorio_sqlalchemy import (
    TarjetaRepositorioSqlAlchemy,
)
from app.shared.dependencies import get_session


def obtener_listar_tarjetas(session: Annotated[Session, Depends(get_session)]) -> ListarTarjetas:
    return ListarTarjetas(TarjetaRepositorioSqlAlchemy(session))
