from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.database import Base


class MovimientoModelo(Base):
    __tablename__ = "movimientos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), index=True
    )
    fecha: Mapped[datetime] = mapped_column(DateTime, index=True)
    descripcion: Mapped[str] = mapped_column(String(200))
    producto: Mapped[str] = mapped_column(String(80))
    tipo: Mapped[str] = mapped_column(String(20))
    valor: Mapped[int]
