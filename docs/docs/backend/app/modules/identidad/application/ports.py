from typing import Protocol


class HasheadorClave(Protocol):
    def hashear(self, clave: str) -> str: ...

    def verificar(self, clave: str, clave_hash: str) -> bool: ...


class EmisorTokens(Protocol):
    def emitir(self, usuario_id: int) -> str:
        """Token de ACCESO (sesión completa)."""
        ...

    def validar(self, token: str) -> int:
        """Devuelve el id de usuario de un token de acceso o lanza TokenInvalidoError."""
        ...

    def emitir_desafio(self, usuario_id: int) -> str:
        """Token de corta duración que solo sirve para completar el segundo factor."""
        ...

    def validar_desafio(self, desafio: str) -> int:
        """Devuelve el id de usuario de un desafío o lanza DesafioInvalidoError."""
        ...


class VerificadorCodigoSeguridad(Protocol):
    """Puerto del código de seguridad (hoy fijo; mañana TOTP/SMS sin tocar el caso de uso)."""

    def verificar(self, usuario_id: int, codigo: str) -> bool: ...
