from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.database import Base


class TarjetaModelo(Base):
    __tablename__ = "tarjetas_credito"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), index=True
    )
    marca: Mapped[str] = mapped_column(String(20))
    nombre: Mapped[str] = mapped_column(String(80))
    ultimos_digitos: Mapped[str] = mapped_column(String(4))
    cupo_total: Mapped[int]
    cupo_utilizado: Mapped[int]
    pago_minimo: Mapped[int]
    pago_total: Mapped[int]
    fecha_limite_pago: Mapped[datetime] = mapped_column(DateTime)
    estado: Mapped[str] = mapped_column(String(20))
