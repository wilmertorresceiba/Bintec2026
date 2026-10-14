from typing import Annotated

from fastapi import APIRouter, Depends

from app.modules.cuentas.application.listar_cuentas import ListarCuentas
from app.modules.cuentas.domain.entities import CuentaAhorro
from app.modules.cuentas.presentation.dependencies import obtener_listar_cuentas
from app.modules.cuentas.presentation.schemas import CuentaAhorroRespuesta
from app.modules.identidad.presentation.dependencies import UsuarioActual

router = APIRouter(prefix="/cuentas", tags=["Cuentas de ahorro"])


@router.get("", response_model=list[CuentaAhorroRespuesta])
def listar_cuentas(
    usuario: UsuarioActual,
    caso: Annotated[ListarCuentas, Depends(obtener_listar_cuentas)],
) -> list[CuentaAhorro]:
    return caso.ejecutar(usuario.id)
