from abc import ABC, abstractmethod

from app.modules.tarjetas.domain.entities import TarjetaCredito


class TarjetaRepositorio(ABC):
    """Puerto de salida: persistencia de tarjetas de crédito."""

    @abstractmethod
    def listar_por_usuario(self, usuario_id: int) -> list[TarjetaCredito]: ...
