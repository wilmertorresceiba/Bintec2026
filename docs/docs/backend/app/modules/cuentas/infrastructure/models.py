from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.database import Base


class CuentaAhorroModelo(Base):
    __tablename__ = "cuentas_ahorro"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), index=True
    )
    tipo: Mapped[str] = mapped_column(String(40))
    ultimos_digitos: Mapped[str] = mapped_column(String(4))
    saldo_total: Mapped[int]
    saldo_disponible: Mapped[int]
    rendimientos_mes: Mapped[int]
    tasa_efectiva_anual: Mapped[float] = mapped_column(Float)
    fecha_apertura: Mapped[datetime] = mapped_column(DateTime)
    estado: Mapped[str] = mapped_column(String(20))
