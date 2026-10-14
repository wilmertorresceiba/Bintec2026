from app.modules.cuentas.domain.entities import CuentaAhorro
from app.modules.cuentas.domain.repositories import CuentaRepositorio


class ListarCuentas:
    """Caso de uso: cuentas de ahorro del cliente (siempre acotadas a su propio usuario)."""

    def __init__(self, repositorio: CuentaRepositorio) -> None:
        self._repositorio = repositorio

    def ejecutar(self, usuario_id: int) -> list[CuentaAhorro]:
        return self._repositorio.listar_por_usuario(usuario_id)
