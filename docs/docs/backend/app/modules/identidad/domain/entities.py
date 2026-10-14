from dataclasses import dataclass, replace
from datetime import datetime, timedelta


@dataclass(frozen=True, slots=True)
class Usuario:
    """Cliente del banco. Es inmutable: los cambios devuelven una copia.

    `intentos_fallidos` y `bloqueado_hasta` implementan el bloqueo temporal ante intentos
    repetidos (la clave de cajero tiene solo 4 dígitos, así que se puede adivinar por fuerza bruta).
    """

    id: int
    nombre: str
    correo: str
    clave_hash: str
    clave_cajero_hash: str
    intentos_fallidos: int = 0
    bloqueado_hasta: datetime | None = None

    def esta_bloqueado(self, ahora: datetime) -> bool:
        return self.bloqueado_hasta is not None and ahora < self.bloqueado_hasta

    def registrar_fallo(
        self, ahora: datetime, max_intentos: int, minutos_bloqueo: int
    ) -> "Usuario":
        """Suma un intento fallido; al llegar al máximo bloquea la cuenta y reinicia el contador."""
        intentos = self.intentos_fallidos + 1
        if intentos >= max_intentos:
            return replace(
                self,
                intentos_fallidos=0,
                bloqueado_hasta=ahora + timedelta(minutes=minutos_bloqueo),
            )
        return replace(self, intentos_fallidos=intentos)

    def limpiar_fallos(self) -> "Usuario":
        return replace(self, intentos_fallidos=0, bloqueado_hasta=None)
