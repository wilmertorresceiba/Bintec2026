import math
from datetime import datetime

from app.shared.errors import DomainError

_SEGUNDOS_POR_MINUTO: int = 60


class CredencialesInvalidasError(DomainError):
    codigo = "credenciales_invalidas"

    def __init__(self) -> None:
        super().__init__("Correo o clave incorrectos. Verifica tus datos e inténtalo de nuevo.")


class SegundoFactorInvalidoError(DomainError):
    codigo = "segundo_factor_invalido"

    def __init__(self) -> None:
        super().__init__(
            "La clave de cajero o el código de seguridad son incorrectos. Inténtalo de nuevo."
        )


class DesafioInvalidoError(DomainError):
    codigo = "desafio_invalido"

    def __init__(self) -> None:
        super().__init__("Tu verificación expiró. Vuelve a iniciar sesión.")


class CuentaBloqueadaError(DomainError):
    codigo = "cuenta_bloqueada"

    def __init__(self, ahora: datetime, bloqueado_hasta: datetime) -> None:
        minutos = max(
            1, math.ceil((bloqueado_hasta - ahora).total_seconds() / _SEGUNDOS_POR_MINUTO)
        )
        super().__init__(
            "Tu cuenta está bloqueada temporalmente por intentos fallidos. "
            f"Inténtalo de nuevo en {minutos} minuto(s)."
        )


class TokenInvalidoError(DomainError):
    codigo = "token_invalido"

    def __init__(self) -> None:
        super().__init__("Tu sesión expiró o no es válida. Inicia sesión nuevamente.")
