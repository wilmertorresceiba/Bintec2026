from abc import ABC, abstractmethod

from app.modules.creditos.domain.entities import Credito


class CreditoRepositorio(ABC):
    """Puerto de salida: persistencia de créditos."""

    @abstractmethod
    def listar_por_usuario(self, usuario_id: int) -> list[Credito]: ...

    @abstractmethod
    def agregar(self, credito: Credito) -> None:
        """Registra el crédito SIN confirmar la transacción (la confirma quien orquesta)."""
        ...
