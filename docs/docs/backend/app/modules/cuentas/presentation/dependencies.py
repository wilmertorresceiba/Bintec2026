from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.modules.cuentas.application.listar_cuentas import ListarCuentas
from app.modules.cuentas.infrastructure.repositorio_sqlalchemy import CuentaRepositorioSqlAlchemy
from app.shared.dependencies import get_session


def obtener_listar_cuentas(session: Annotated[Session, Depends(get_session)]) -> ListarCuentas:
    return ListarCuentas(CuentaRepositorioSqlAlchemy(session))
