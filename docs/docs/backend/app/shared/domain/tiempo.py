from datetime import UTC, datetime


def ahora_utc() -> datetime:
    return datetime.now(UTC)


def como_utc(valor: datetime) -> datetime:
    """SQLite devuelve fechas sin zona horaria; las tratamos como UTC."""
    return valor if valor.tzinfo else valor.replace(tzinfo=UTC)
