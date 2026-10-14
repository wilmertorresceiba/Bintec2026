from typing import Annotated

from fastapi import APIRouter, Depends

from app.modules.identidad.presentation.dependencies import UsuarioActual
from app.modules.notificaciones.application.casos_de_uso import (
    AceptarOfertaCredito,
    DetalleNotificacion,
    ListarNotificaciones,
    ObtenerDetalleNotificacion,
    RechazarOfertaCredito,
)
from app.modules.notificaciones.domain.entities import Notificacion
from app.modules.notificaciones.presentation.dependencies import (
    obtener_aceptar_oferta,
    obtener_detalle_notificacion,
    obtener_listar_notificaciones,
    obtener_rechazar_oferta,
)
from app.modules.notificaciones.presentation.schemas import (
    NotificacionDetalleRespuesta,
    NotificacionRespuesta,
)

router = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])


@router.get("", response_model=list[NotificacionRespuesta])
def listar_notificaciones(
    usuario: UsuarioActual,
    caso: Annotated[ListarNotificaciones, Depends(obtener_listar_notificaciones)],
) -> list[Notificacion]:
    """Notificaciones activas: permanecen hasta que el cliente acepta o rechaza la oferta."""
    return caso.ejecutar(usuario.id)


@router.get("/{notificacion_id}", response_model=NotificacionDetalleRespuesta)
def detalle_notificacion(
    notificacion_id: str,
    usuario: UsuarioActual,
    caso: Annotated[ObtenerDetalleNotificacion, Depends(obtener_detalle_notificacion)],
) -> DetalleNotificacion:
    """Detalle de una notificación; para el crédito preaprobado incluye sus condiciones."""
    return caso.ejecutar(usuario.id, notificacion_id)


@router.post("/{notificacion_id}/aceptar", response_model=NotificacionRespuesta)
def aceptar_oferta(
    notificacion_id: str,
    usuario: UsuarioActual,
    caso: Annotated[AceptarOfertaCredito, Depends(obtener_aceptar_oferta)],
) -> Notificacion:
    """Acepta el crédito preaprobado: crea el crédito de libre inversión del cliente."""
    return caso.ejecutar(usuario.id, notificacion_id)


@router.post("/{notificacion_id}/rechazar", response_model=NotificacionRespuesta)
def rechazar_oferta(
    notificacion_id: str,
    usuario: UsuarioActual,
    caso: Annotated[RechazarOfertaCredito, Depends(obtener_rechazar_oferta)],
) -> Notificacion:
    """Rechaza el crédito preaprobado: no se crea ningún crédito."""
    return caso.ejecutar(usuario.id, notificacion_id)
