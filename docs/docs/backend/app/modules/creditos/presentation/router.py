from typing import Annotated

from fastapi import APIRouter, Depends

from app.modules.creditos.application.listar_creditos import ListarCreditos
from app.modules.creditos.domain.entities import Credito
from app.modules.creditos.presentation.dependencies import obtener_listar_creditos
from app.modules.creditos.presentation.schemas import CreditoRespuesta
from app.modules.identidad.presentation.dependencies import UsuarioActual

router = APIRouter(prefix="/creditos", tags=["Créditos"])


@router.get("", response_model=list[CreditoRespuesta])
def listar_creditos(
    usuario: UsuarioActual,
    caso: Annotated[ListarCreditos, Depends(obtener_listar_creditos)],
) -> list[Credito]:
    return caso.ejecutar(usuario.id)
