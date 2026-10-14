from abc import ABC, abstractmethod

from app.modules.cuentas.domain.entities import CuentaAhorro


class CuentaRepositorio(ABC):
    """Puerto de salida: persistencia de cuentas de ahorro."""

    @abstractmethod
    def listar_por_usuario(self, usuario_id: int) -> list[CuentaAhorro]: ...
