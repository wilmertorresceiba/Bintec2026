from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.creditos.domain.entities import Credito, TipoCredito
from app.modules.creditos.domain.repositories import CreditoRepositorio
from app.modules.creditos.infrastructure.models import CreditoModelo
from app.shared.domain.estado_producto import EstadoProducto
from app.shared.domain.tiempo import como_utc


def _a_dominio(modelo: CreditoModelo) -> Credito:
    return Credito(
        id=modelo.id,
        usuario_id=modelo.usuario_id,
        tipo=TipoCredito(modelo.tipo),
        ultimos_digitos=modelo.ultimos_digitos,
        monto_original=modelo.monto_original,
        saldo_capital=modelo.saldo_capital,
        valor_cuota=modelo.valor_cuota,
        cuotas_pagadas=modelo.cuotas_pagadas,
        cuotas_totales=modelo.cuotas_totales,
        tasa_mensual=modelo.tasa_mensual,
        proximo_pago=como_utc(modelo.proximo_pago),
        estado=EstadoProducto(modelo.estado),
    )


class CreditoRepositorioSqlAlchemy(CreditoRepositorio):
    def __init__(self, session: Session) -> None:
        self._session = session

    def agregar(self, credito: Credito) -> None:
        self._session.add(
            CreditoModelo(
                id=credito.id,
                usuario_id=credito.usuario_id,
                tipo=credito.tipo.value,
                ultimos_digitos=credito.ultimos_digitos,
                monto_original=credito.monto_original,
                saldo_capital=credito.saldo_capital,
                valor_cuota=credito.valor_cuota,
                cuotas_pagadas=credito.cuotas_pagadas,
                cuotas_totales=credito.cuotas_totales,
                tasa_mensual=credito.tasa_mensual,
                proximo_pago=credito.proximo_pago.replace(tzinfo=None),
                estado=credito.estado.value,
            )
        )
        self._session.flush()

    def listar_por_usuario(self, usuario_id: int) -> list[Credito]:
        consulta = (
            select(CreditoModelo)
            .where(CreditoModelo.usuario_id == usuario_id)
            .order_by(CreditoModelo.proximo_pago, CreditoModelo.id)
        )
        return [_a_dominio(m) for m in self._session.scalars(consulta)]
