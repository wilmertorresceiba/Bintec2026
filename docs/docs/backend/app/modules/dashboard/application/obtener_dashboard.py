from dataclasses import dataclass

from app.modules.creditos.application.listar_creditos import ListarCreditos
from app.modules.creditos.domain.entities import Credito
from app.modules.dashboard.domain.resumen import ResumenFinanciero, calcular_resumen
from app.modules.movimientos.application.listar_movimientos import ListarMovimientos
from app.modules.movimientos.domain.entities import Movimiento
from app.modules.tarjetas.application.listar_tarjetas import ListarTarjetas
from app.modules.tarjetas.domain.entities import TarjetaCredito

MOVIMIENTOS_EN_DASHBOARD: int = 6


@dataclass(frozen=True, slots=True)
class DashboardDTO:
    resumen: ResumenFinanciero
    tarjetas: list[TarjetaCredito]
    creditos: list[Credito]
    movimientos: list[Movimiento]


class ObtenerDashboard:
    """Caso de uso: compone la vista consolidada del cliente a partir de los demás dominios."""

    def __init__(
        self,
        listar_tarjetas: ListarTarjetas,
        listar_creditos: ListarCreditos,
        listar_movimientos: ListarMovimientos,
    ) -> None:
        self._listar_tarjetas = listar_tarjetas
        self._listar_creditos = listar_creditos
        self._listar_movimientos = listar_movimientos

    def ejecutar(self, usuario_id: int) -> DashboardDTO:
        tarjetas = self._listar_tarjetas.ejecutar(usuario_id)
        creditos = self._listar_creditos.ejecutar(usuario_id)
        return DashboardDTO(
            resumen=calcular_resumen(tarjetas, creditos),
            tarjetas=tarjetas,
            creditos=creditos,
            movimientos=self._listar_movimientos.ejecutar(usuario_id, MOVIMIENTOS_EN_DASHBOARD),
        )
