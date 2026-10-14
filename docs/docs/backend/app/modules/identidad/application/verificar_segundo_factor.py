from collections.abc import Callable
from datetime import datetime

from app.modules.identidad.application.iniciar_sesion import SesionDTO
from app.modules.identidad.application.ports import (
    EmisorTokens,
    HasheadorClave,
    VerificadorCodigoSeguridad,
)
from app.modules.identidad.domain.entities import Usuario
from app.modules.identidad.domain.exceptions import (
    CuentaBloqueadaError,
    DesafioInvalidoError,
    SegundoFactorInvalidoError,
)
from app.modules.identidad.domain.repositories import UsuarioRepositorio
from app.shared.domain.tiempo import ahora_utc


class VerificarSegundoFactor:
    """Paso 2 del login: clave de cajero + código de seguridad → sesión (token de acceso).

    Ante un fallo suma un intento y, al llegar al máximo, bloquea temporalmente la cuenta.
    """

    def __init__(
        self,
        repositorio: UsuarioRepositorio,
        hasheador: HasheadorClave,
        verificador_codigo: VerificadorCodigoSeguridad,
        emisor: EmisorTokens,
        max_intentos: int,
        minutos_bloqueo: int,
        reloj: Callable[[], datetime] = ahora_utc,
    ) -> None:
        self._repositorio = repositorio
        self._hasheador = hasheador
        self._verificador_codigo = verificador_codigo
        self._emisor = emisor
        self._max_intentos = max_intentos
        self._minutos_bloqueo = minutos_bloqueo
        self._reloj = reloj

    def ejecutar(self, desafio: str, clave_cajero: str, codigo_seguridad: str) -> SesionDTO:
        ahora = self._reloj()
        usuario: Usuario | None = self._repositorio.obtener_por_id(
            self._emisor.validar_desafio(desafio)
        )
        if usuario is None:
            raise DesafioInvalidoError
        if usuario.bloqueado_hasta is not None and usuario.esta_bloqueado(ahora):
            raise CuentaBloqueadaError(ahora, usuario.bloqueado_hasta)

        # Se evalúan ambos factores siempre: no se revela cuál de los dos falló.
        cajero_ok = self._hasheador.verificar(clave_cajero, usuario.clave_cajero_hash)
        codigo_ok = self._verificador_codigo.verificar(usuario.id, codigo_seguridad)
        if not (cajero_ok and codigo_ok):
            fallido = usuario.registrar_fallo(ahora, self._max_intentos, self._minutos_bloqueo)
            self._repositorio.guardar(fallido)
            if fallido.bloqueado_hasta is not None and fallido.esta_bloqueado(ahora):
                raise CuentaBloqueadaError(ahora, fallido.bloqueado_hasta)
            raise SegundoFactorInvalidoError

        self._repositorio.guardar(usuario.limpiar_fallos())
        return SesionDTO(token=self._emisor.emitir(usuario.id), usuario=usuario)
