from app.modules.identidad.application.ports import EmisorTokens
from app.modules.identidad.domain.entities import Usuario
from app.modules.identidad.domain.exceptions import TokenInvalidoError
from app.modules.identidad.domain.repositories import UsuarioRepositorio


class ObtenerUsuarioActual:
    """Caso de uso: resuelve el usuario dueño de un token de acceso."""

    def __init__(self, repositorio: UsuarioRepositorio, emisor: EmisorTokens) -> None:
        self._repositorio = repositorio
        self._emisor = emisor

    def ejecutar(self, token: str) -> Usuario:
        usuario: Usuario | None = self._repositorio.obtener_por_id(self._emisor.validar(token))
        if usuario is None:
            raise TokenInvalidoError
        return usuario
