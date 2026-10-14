from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.modules.creditos.infrastructure.repositorio_sqlalchemy import (
    CreditoRepositorioSqlAlchemy,
)
from app.modules.notificaciones.application.casos_de_uso import (
    AceptarOfertaCredito,
    ListarNotificaciones,
    ObtenerDetalleNotificacion,
    RechazarOfertaCredito,
)
from app.modules.notificaciones.infrastructure.repositorio_sqlalchemy import (
    NotificacionRepositorioSqlAlchemy,
)
from app.shared.dependencies import get_session

SessionDep = Annotated[Session, Depends(get_session)]


def obtener_listar_notificaciones(session: SessionDep) -> ListarNotificaciones:
    return ListarNotificaciones(NotificacionRepositorioSqlAlchemy(session))


def obtener_aceptar_oferta(session: SessionDep) -> AceptarOfertaCredito:
    # Ambos repositorios comparten la misma sesión: la oferta y el crédito se confirman juntos.
    return AceptarOfertaCredito(
        NotificacionRepositorioSqlAlchemy(session), CreditoRepositorioSqlAlchemy(session)
    )


def obtener_rechazar_oferta(session: SessionDep) -> RechazarOfertaCredito:
    return RechazarOfertaCredito(NotificacionRepositorioSqlAlchemy(session))


def obtener_detalle_notificacion(session: SessionDep) -> ObtenerDetalleNotificacion:
    return ObtenerDetalleNotificacion(NotificacionRepositorioSqlAlchemy(session))
