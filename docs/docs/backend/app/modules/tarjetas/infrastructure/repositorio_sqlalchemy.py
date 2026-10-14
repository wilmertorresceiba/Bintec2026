from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.tarjetas.domain.entities import MarcaTarjeta, TarjetaCredito
from app.modules.tarjetas.domain.repositories import TarjetaRepositorio
from app.modules.tarjetas.infrastructure.models import TarjetaModelo
from app.shared.domain.estado_producto import EstadoProducto
from app.shared.domain.tiempo import como_utc


def _a_dominio(modelo: TarjetaModelo) -> TarjetaCredito:
    return TarjetaCredito(
        id=modelo.id,
        usuario_id=modelo.usuario_id,
        marca=MarcaTarjeta(modelo.marca),
        nombre=modelo.nombre,
        ultimos_digitos=modelo.ultimos_digitos,
        cupo_total=modelo.cupo_total,
        cupo_utilizado=modelo.cupo_utilizado,
        pago_minimo=modelo.pago_minimo,
        pago_total=modelo.pago_total,
        fecha_limite_pago=como_utc(modelo.fecha_limite_pago),
        estado=EstadoProducto(modelo.estado),
    )


class TarjetaRepositorioSqlAlchemy(TarjetaRepositorio):
    def __init__(self, session: Session) -> None:
        self._session = session

    def listar_por_usuario(self, usuario_id: int) -> list[TarjetaCredito]:
        consulta = (
            select(TarjetaModelo)
            .where(TarjetaModelo.usuario_id == usuario_id)
            .order_by(TarjetaModelo.fecha_limite_pago, TarjetaModelo.id)
        )
        return [_a_dominio(m) for m in self._session.scalars(consulta)]
