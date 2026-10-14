from datetime import UTC, datetime

from app.modules.analitica.domain.entities import CargoConsumo, PeriodoUso, SerieConsumo
from app.modules.analitica.domain.servicio import construir_serie
from app.modules.movimientos.domain.repositories import MovimientoRepositorio


class ObtenerConsumo:
    """Caso de uso: serie de consumo con tarjetas por año, mes o día (acotada al cliente)."""

    def __init__(self, movimientos: MovimientoRepositorio) -> None:
        self._movimientos = movimientos

    def ejecutar(
        self, usuario_id: int, periodo: PeriodoUso, anio: int, mes: int | None
    ) -> SerieConsumo:
        rango = self._movimientos.rango_anios_consumo(usuario_id)
        anios = list(range(rango[0], rango[1] + 1)) if rango else [anio]
        desde, hasta = self._intervalo(periodo, anio, mes, anios)
        cargos = [
            CargoConsumo(fecha=m.fecha, producto=m.producto, monto=-m.valor)
            for m in self._movimientos.listar_consumos(usuario_id, desde, hasta)
        ]
        return construir_serie(periodo, anio, mes, cargos, anios)

    @staticmethod
    def _intervalo(
        periodo: PeriodoUso, anio: int, mes: int | None, anios: list[int]
    ) -> tuple[datetime, datetime]:
        """Intervalo semiabierto [desde, hasta) que cubre el periodo consultado."""
        match periodo:
            case PeriodoUso.ANIO:
                return datetime(anios[0], 1, 1, tzinfo=UTC), datetime(
                    anios[-1] + 1, 1, 1, tzinfo=UTC
                )
            case PeriodoUso.MES:
                return datetime(anio, 1, 1, tzinfo=UTC), datetime(anio + 1, 1, 1, tzinfo=UTC)
            case PeriodoUso.DIA:
                inicio_mes = mes or 1
                siguiente = (anio + 1, 1) if inicio_mes == 12 else (anio, inicio_mes + 1)
                return (
                    datetime(anio, inicio_mes, 1, tzinfo=UTC),
                    datetime(siguiente[0], siguiente[1], 1, tzinfo=UTC),
                )
