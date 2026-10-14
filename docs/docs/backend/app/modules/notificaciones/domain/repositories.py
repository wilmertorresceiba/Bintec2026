from abc import ABC, abstractmethod

from app.modules.notificaciones.domain.entities import Notificacion


class NotificacionRepositorio(ABC):
    """Puerto de salida: persistencia de notificaciones."""

    @abstractmethod
    def listar_activas_por_usuario(self, usuario_id: int) -> list[Notificacion]:
        """Notificaciones PENDIENTES del usuario, de la más reciente a la más antigua."""
        ...

    @abstractmethod
    def obtener(self, usuario_id: int, notificacion_id: str) -> Notificacion | None:
        """Solo devuelve la notificación si pertenece al usuario."""
        ...

    @abstractmethod
    def guardar(self, notificacion: Notificacion) -> None:
        """Persiste el cambio de estado y CONFIRMA la transacción en curso."""
        ...
