from abc import ABC, abstractmethod

from app.modules.identidad.domain.entities import Usuario


class UsuarioRepositorio(ABC):
    """Puerto de salida: persistencia de usuarios."""

    @abstractmethod
    def obtener_por_correo(self, correo: str) -> Usuario | None: ...

    @abstractmethod
    def obtener_por_id(self, usuario_id: int) -> Usuario | None: ...

    @abstractmethod
    def guardar(self, usuario: Usuario) -> None:
        """Persiste el estado de bloqueo (intentos fallidos y fecha de bloqueo)."""
        ...
