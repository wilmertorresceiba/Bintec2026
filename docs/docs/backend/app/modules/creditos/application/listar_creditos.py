from app.modules.creditos.domain.entities import Credito
from app.modules.creditos.domain.repositories import CreditoRepositorio


class ListarCreditos:
    """Caso de uso: créditos del cliente (siempre acotados a su propio usuario)."""

    def __init__(self, repositorio: CreditoRepositorio) -> None:
        self._repositorio = repositorio

    def ejecutar(self, usuario_id: int) -> list[Credito]:
        return self._repositorio.listar_por_usuario(usuario_id)
