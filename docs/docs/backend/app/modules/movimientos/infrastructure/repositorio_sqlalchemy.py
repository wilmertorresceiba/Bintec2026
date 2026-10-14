from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.movimientos.domain.entities import Movimiento, TipoMovimiento
from app.modules.movimientos.domain.repositories import MovimientoRepositorio
from app.modules.movimientos.infrastructure.models import MovimientoModelo
from app.shared.domain.tiempo import como_utc

_TIPOS_CONSUMO: tuple[str, ...] = (TipoMovimiento.COMPRA.value, TipoMovimiento.AVANCE.value)


def _a_dominio(modelo: MovimientoModelo) -> Movimiento:
    return Movimiento(
        id=modelo.id,
        usuario_id=modelo.usuario_id,
        fecha=como_utc(modelo.fecha),
        descripcion=modelo.descripcion,
        producto=modelo.producto,
        tipo=TipoMovimiento(modelo.tipo),
        valor=modelo.valor,
    )


def _sin_zona(fecha: datetime) -> datetime:
    return fecha.replace(tzinfo=None)


class MovimientoRepositorioSqlAlchemy(MovimientoRepositorio):
    def __init__(self, session: Session) -> None:
        self._session = session

    def listar_recientes(self, usuario_id: int, limite: int) -> list[Movimiento]:
        consulta = (
            select(MovimientoModelo)
            .where(MovimientoModelo.usuario_id == usuario_id)
            .order_by(MovimientoModelo.fecha.desc(), MovimientoModelo.id)
            .limit(limite)
        )
        return [_a_dominio(m) for m in self._session.scalars(consulta)]

    def listar_consumos(
        self, usuario_id: int, desde: datetime, hasta: datetime
    ) -> list[Movimiento]:
        consulta = select(MovimientoModelo).where(
            MovimientoModelo.usuario_id == usuario_id,
            MovimientoModelo.tipo.in_(_TIPOS_CONSUMO),
            MovimientoModelo.valor < 0,
            MovimientoModelo.fecha >= _sin_zona(desde),
            MovimientoModelo.fecha < _sin_zona(hasta),
        )
        return [_a_dominio(m) for m in self._session.scalars(consulta)]

    def buscar(
        self,
        usuario_id: int,
        desde: datetime | None,
        hasta: datetime | None,
        tipo: TipoMovimiento | None,
        limite: int,
    ) -> list[Movimiento]:
        consulta = select(MovimientoModelo).where(MovimientoModelo.usuario_id == usuario_id)
        if desde is not None:
            consulta = consulta.where(MovimientoModelo.fecha >= _sin_zona(desde))
        if hasta is not None:
            consulta = consulta.where(MovimientoModelo.fecha < _sin_zona(hasta))
        if tipo is not None:
            consulta = consulta.where(MovimientoModelo.tipo == tipo.value)
        consulta = consulta.order_by(MovimientoModelo.fecha.desc(), MovimientoModelo.id).limit(
            limite
        )
        return [_a_dominio(m) for m in self._session.scalars(consulta)]

    def rango_anios_consumo(self, usuario_id: int) -> tuple[int, int] | None:
        primera, ultima = self._session.execute(
            select(func.min(MovimientoModelo.fecha), func.max(MovimientoModelo.fecha)).where(
                MovimientoModelo.usuario_id == usuario_id,
                MovimientoModelo.tipo.in_(_TIPOS_CONSUMO),
                MovimientoModelo.valor < 0,
            )
        ).one()
        if primera is None or ultima is None:
            return None
        return como_utc(primera).year, como_utc(ultima).year
