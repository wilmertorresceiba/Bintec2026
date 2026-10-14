from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.database import Base


class CreditoModelo(Base):
    __tablename__ = "creditos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), index=True
    )
    tipo: Mapped[str] = mapped_column(String(40))
    ultimos_digitos: Mapped[str] = mapped_column(String(4))
    monto_original: Mapped[int]
    saldo_capital: Mapped[int]
    valor_cuota: Mapped[int]
    cuotas_pagadas: Mapped[int]
    cuotas_totales: Mapped[int]
    tasa_mensual: Mapped[float] = mapped_column(Float)
    proximo_pago: Mapped[datetime] = mapped_column(DateTime)
    estado: Mapped[str] = mapped_column(String(20))
