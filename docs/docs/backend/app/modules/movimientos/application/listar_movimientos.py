from app.modules.movimientos.domain.entities import Movimiento
from app.modules.movimientos.domain.repositories import MovimientoRepositorio

LIMITE_POR_DEFECTO: int = 20
LIMITE_MAXIMO: int = 100


class ListarMovimientos:
    """Caso de uso: últimos movimientos del cliente, con un límite acotado."""

    def __init__(self, repositorio: MovimientoRepositorio) -> None:
        self._repositorio = repositorio

    def ejecutar(self, usuario_id: int, limite: int = LIMITE_POR_DEFECTO) -> list[Movimiento]:
        limite_efectivo: int = max(1, min(limite, LIMITE_MAXIMO))
        return self._repositorio.listar_recientes(usuario_id, limite_efectivo)
