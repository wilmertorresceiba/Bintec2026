from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.cuentas.domain.entities import CuentaAhorro, EstadoCuenta, TipoCuenta
from app.modules.cuentas.domain.repositories import CuentaRepositorio
from app.modules.cuentas.infrastructure.models import CuentaAhorroModelo
from app.shared.domain.tiempo import como_utc


def _a_dominio(modelo: CuentaAhorroModelo) -> CuentaAhorro:
    return CuentaAhorro(
        id=modelo.id,
        usuario_id=modelo.usuario_id,
        tipo=TipoCuenta(modelo.tipo),
        ultimos_digitos=modelo.ultimos_digitos,
        saldo_total=modelo.saldo_total,
        saldo_disponible=modelo.saldo_disponible,
        rendimientos_mes=modelo.rendimientos_mes,
        tasa_efectiva_anual=modelo.tasa_efectiva_anual,
        fecha_apertura=como_utc(modelo.fecha_apertura),
        estado=EstadoCuenta(modelo.estado),
    )


class CuentaRepositorioSqlAlchemy(CuentaRepositorio):
    def __init__(self, session: Session) -> None:
        self._session = session

    def listar_por_usuario(self, usuario_id: int) -> list[CuentaAhorro]:
        consulta = (
            select(CuentaAhorroModelo)
            .where(CuentaAhorroModelo.usuario_id == usuario_id)
            .order_by(CuentaAhorroModelo.fecha_apertura, CuentaAhorroModelo.id)
        )
        return [_a_dominio(m) for m in self._session.scalars(consulta)]
