from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.modules.creditos.application.listar_creditos import ListarCreditos
from app.modules.creditos.infrastructure.repositorio_sqlalchemy import (
    CreditoRepositorioSqlAlchemy,
)
from app.shared.dependencies import get_session


def obtener_listar_creditos(session: Annotated[Session, Depends(get_session)]) -> ListarCreditos:
    return ListarCreditos(CreditoRepositorioSqlAlchemy(session))
