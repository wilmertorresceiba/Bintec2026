from app.modules.tarjetas.domain.entities import TarjetaCredito
from app.modules.tarjetas.domain.repositories import TarjetaRepositorio


class ListarTarjetas:
    """Caso de uso: tarjetas de crédito del cliente (siempre acotadas a su propio usuario)."""

    def __init__(self, repositorio: TarjetaRepositorio) -> None:
        self._repositorio = repositorio

    def ejecutar(self, usuario_id: int) -> list[TarjetaCredito]:
        return self._repositorio.listar_por_usuario(usuario_id)
