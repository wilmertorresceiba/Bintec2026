from typing import Annotated

from fastapi import APIRouter, Depends

from app.modules.dashboard.application.obtener_dashboard import DashboardDTO, ObtenerDashboard
from app.modules.dashboard.presentation.dependencies import obtener_dashboard
from app.modules.dashboard.presentation.schemas import DashboardRespuesta
from app.modules.identidad.presentation.dependencies import UsuarioActual

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardRespuesta)
def consultar_dashboard(
    usuario: UsuarioActual,
    caso: Annotated[ObtenerDashboard, Depends(obtener_dashboard)],
) -> DashboardDTO:
    return caso.ejecutar(usuario.id)
