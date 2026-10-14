from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.notificaciones.domain.entities import (
    EstadoNotificacion,
    Notificacion,
    TipoNotificacion,
)
from app.modules.notificaciones.domain.repositories import NotificacionRepositorio
from app.modules.notificaciones.infrastructure.models import NotificacionModelo
from app.shared.domain.tiempo import como_utc


def _a_dominio(modelo: NotificacionModelo) -> Notificacion:
    return Notificacion(
        id=modelo.id,
        usuario_id=modelo.usuario_id,
        tipo=TipoNotificacion(modelo.tipo),
        titulo=modelo.titulo,
        mensaje=modelo.mensaje,
        fecha=como_utc(modelo.fecha),
        estado=EstadoNotificacion(modelo.estado),
    )


class NotificacionRepositorioSqlAlchemy(NotificacionRepositorio):
    def __init__(self, session: Session) -> None:
        self._session = session

    def listar_activas_por_usuario(self, usuario_id: int) -> list[Notificacion]:
        consulta = (
            select(NotificacionModelo)
            .where(
                NotificacionModelo.usuario_id == usuario_id,
                NotificacionModelo.estado == EstadoNotificacion.PENDIENTE.value,
            )
            .order_by(NotificacionModelo.fecha.desc(), NotificacionModelo.id)
        )
        return [_a_dominio(m) for m in self._session.scalars(consulta)]

    def obtener(self, usuario_id: int, notificacion_id: str) -> Notificacion | None:
        modelo = self._session.scalar(
            select(NotificacionModelo).where(
                NotificacionModelo.id == notificacion_id,
                NotificacionModelo.usuario_id == usuario_id,
            )
        )
        return _a_dominio(modelo) if modelo else None

    def guardar(self, notificacion: Notificacion) -> None:
        modelo = self._session.get(NotificacionModelo, notificacion.id)
        if modelo is not None:
            modelo.estado = notificacion.estado.value
        self._session.commit()
