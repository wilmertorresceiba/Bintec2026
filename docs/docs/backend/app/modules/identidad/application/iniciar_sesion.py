from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime

from app.modules.identidad.application.ports import EmisorTokens, HasheadorClave
from app.modules.identidad.domain.entities import Usuario
from app.modules.identidad.domain.exceptions import (
    CredencialesInvalidasError,
    CuentaBloqueadaError,
)
from app.modules.identidad.domain.repositories import UsuarioRepositorio
from app.shared.domain.tiempo import ahora_utc


@dataclass(frozen=True, slots=True)
class DesafioDTO:
    """Resultado del paso 1: aún NO hay sesión, solo un desafío para el segundo factor."""

    desafio: str


@dataclass(frozen=True, slots=True)
class SesionDTO:
    token: str
    usuario: Usuario


class IniciarSesion:
    """Paso 1 del login: valida correo y clave y entrega un desafío para el segundo factor."""

    def __init__(
        self,
        repositorio: UsuarioRepositorio,
        hasheador: HasheadorClave,
        emisor: EmisorTokens,
        max_intentos: int,
        minutos_bloqueo: int,
        reloj: Callable[[], datetime] = ahora_utc,
    ) -> None:
        self._repositorio = repositorio
        self._hasheador = hasheador
        self._emisor = emisor
        self._max_intentos = max_intentos
        self._minutos_bloqueo = minutos_bloqueo
        self._reloj = reloj

    def ejecutar(self, correo: str, clave: str) -> DesafioDTO:
        ahora = self._reloj()
        usuario: Usuario | None = self._repositorio.obtener_por_correo(correo.strip().lower())
        # Mismo error para correo inexistente y clave errónea (evita enumerar usuarios).
        if usuario is None:
            raise CredencialesInvalidasError
        if usuario.bloqueado_hasta is not None and usuario.esta_bloqueado(ahora):
            raise CuentaBloqueadaError(ahora, usuario.bloqueado_hasta)
        if not self._hasheador.verificar(clave, usuario.clave_hash):
            fallido = usuario.registrar_fallo(ahora, self._max_intentos, self._minutos_bloqueo)
            self._repositorio.guardar(fallido)
            if fallido.bloqueado_hasta is not None and fallido.esta_bloqueado(ahora):
                raise CuentaBloqueadaError(ahora, fallido.bloqueado_hasta)
            raise CredencialesInvalidasError
        return DesafioDTO(desafio=self._emisor.emitir_desafio(usuario.id))
