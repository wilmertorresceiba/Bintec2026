from typing import Annotated

from fastapi import APIRouter, Depends

from app.modules.identidad.presentation.dependencies import UsuarioActual
from app.modules.tarjetas.application.listar_tarjetas import ListarTarjetas
from app.modules.tarjetas.domain.entities import TarjetaCredito
from app.modules.tarjetas.presentation.dependencies import obtener_listar_tarjetas
from app.modules.tarjetas.presentation.schemas import TarjetaRespuesta

router = APIRouter(prefix="/tarjetas", tags=["Tarjetas de crédito"])


@router.get("", response_model=list[TarjetaRespuesta])
def listar_tarjetas(
    usuario: UsuarioActual,
    caso: Annotated[ListarTarjetas, Depends(obtener_listar_tarjetas)],
) -> list[TarjetaCredito]:
    return caso.ejecutar(usuario.id)
