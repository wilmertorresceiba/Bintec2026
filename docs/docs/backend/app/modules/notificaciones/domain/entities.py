from dataclasses import dataclass, replace
from datetime import datetime
from enum import StrEnum

from app.shared.errors import DomainError


class TipoNotificacion(StrEnum):
    CREDITO_PREAPROBADO = "CREDITO_PREAPROBADO"


class EstadoNotificacion(StrEnum):
    """Una notificación está activa (PENDIENTE) hasta que el cliente decide."""

    PENDIENTE = "PENDIENTE"
    ACEPTADA = "ACEPTADA"
    RECHAZADA = "RECHAZADA"


class NotificacionYaResueltaError(DomainError):
    codigo = "notificacion_resuelta"

    def __init__(self) -> None:
        super().__init__("Esta oferta ya fue resuelta y no se puede modificar")


@dataclass(frozen=True, slots=True)
class Notificacion:
    """Aviso dirigido a un cliente. Es inmutable: decidir devuelve una copia.

    Invariante: solo una notificación PENDIENTE puede aceptarse o rechazarse (una sola vez).
    """

    id: str
    usuario_id: int
    tipo: TipoNotificacion
    titulo: str
    mensaje: str
    fecha: datetime
    estado: EstadoNotificacion = EstadoNotificacion.PENDIENTE

    @property
    def activa(self) -> bool:
        return self.estado is EstadoNotificacion.PENDIENTE

    def aceptar(self) -> "Notificacion":
        return self._resolver(EstadoNotificacion.ACEPTADA)

    def rechazar(self) -> "Notificacion":
        return self._resolver(EstadoNotificacion.RECHAZADA)

    def _resolver(self, estado: EstadoNotificacion) -> "Notificacion":
        if not self.activa:
            raise NotificacionYaResueltaError
        return replace(self, estado=estado)
