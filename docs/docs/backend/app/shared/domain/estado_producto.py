from enum import StrEnum


class EstadoProducto(StrEnum):
    """Estado de un producto financiero (kernel compartido entre dominios)."""

    AL_DIA = "AL_DIA"
    EN_MORA = "EN_MORA"
    BLOQUEADA = "BLOQUEADA"
