"""Adaptadores de seguridad: hash de claves (scrypt), tokens JWT y código de seguridad."""

import base64
import hashlib
import hmac
import secrets
from datetime import timedelta

import jwt

from app.modules.identidad.domain.exceptions import DesafioInvalidoError, TokenInvalidoError
from app.shared.domain.tiempo import ahora_utc

_N: int = 2**14
_R: int = 8
_P: int = 1
_LONGITUD: int = 32

TIPO_ACCESO: str = "acceso"
TIPO_DESAFIO: str = "desafio"


def _b64(datos: bytes) -> str:
    return base64.b64encode(datos).decode("ascii")


class HasheadorScrypt:
    """Hash de claves con scrypt de la biblioteca estándar (sin dependencias nativas)."""

    def hashear(self, clave: str) -> str:
        sal: bytes = secrets.token_bytes(16)
        derivada: bytes = hashlib.scrypt(
            clave.encode(), salt=sal, n=_N, r=_R, p=_P, dklen=_LONGITUD
        )
        return f"scrypt${_N}${_R}${_P}${_b64(sal)}${_b64(derivada)}"

    def verificar(self, clave: str, clave_hash: str) -> bool:
        try:
            _, n, r, p, sal, esperado = clave_hash.split("$")
            derivada: bytes = hashlib.scrypt(
                clave.encode(),
                salt=base64.b64decode(sal),
                n=int(n),
                r=int(r),
                p=int(p),
                dklen=_LONGITUD,
            )
        except ValueError:
            return False
        return hmac.compare_digest(derivada, base64.b64decode(esperado))


class EmisorTokensJwt:
    """Emite dos tipos de token con la claim `typ`: así un desafío NUNCA sirve como sesión."""

    def __init__(
        self,
        secreto: str,
        algoritmo: str,
        expiracion_minutos: int,
        desafio_minutos: int = 5,
    ) -> None:
        self._secreto = secreto
        self._algoritmo = algoritmo
        self._expiracion = timedelta(minutes=expiracion_minutos)
        self._expiracion_desafio = timedelta(minutes=desafio_minutos)

    def emitir(self, usuario_id: int) -> str:
        return self._emitir(usuario_id, TIPO_ACCESO, self._expiracion)

    def emitir_desafio(self, usuario_id: int) -> str:
        return self._emitir(usuario_id, TIPO_DESAFIO, self._expiracion_desafio)

    def validar(self, token: str) -> int:
        try:
            return self._decodificar(token, TIPO_ACCESO)
        except (jwt.PyJWTError, KeyError, ValueError) as error:
            raise TokenInvalidoError from error

    def validar_desafio(self, desafio: str) -> int:
        try:
            return self._decodificar(desafio, TIPO_DESAFIO)
        except (jwt.PyJWTError, KeyError, ValueError) as error:
            raise DesafioInvalidoError from error

    def _emitir(self, usuario_id: int, tipo: str, duracion: timedelta) -> str:
        ahora = ahora_utc()
        carga = {"sub": str(usuario_id), "typ": tipo, "iat": ahora, "exp": ahora + duracion}
        return jwt.encode(carga, self._secreto, algorithm=self._algoritmo)

    def _decodificar(self, token: str, tipo_esperado: str) -> int:
        carga = jwt.decode(token, self._secreto, algorithms=[self._algoritmo])
        if carga["typ"] != tipo_esperado:
            raise ValueError("tipo de token inesperado")
        return int(carga["sub"])


class CodigoSeguridadEstatico:
    """Verificador DEMO: un único código fijo para todos los usuarios."""

    def __init__(self, codigo: str) -> None:
        self._codigo = codigo

    def verificar(self, usuario_id: int, codigo: str) -> bool:  # noqa: ARG002
        return hmac.compare_digest(codigo.encode(), self._codigo.encode())
