from datetime import datetime

from app.shared.schemas import EsquemaCamel


class CreditoRespuesta(EsquemaCamel):
    id: str
    tipo: str
    numero: str
    monto_original: int
    saldo_capital: int
    valor_cuota: int
    cuotas_pagadas: int
    cuotas_totales: int
    tasa_mensual: float
    proximo_pago: datetime
    estado: str
