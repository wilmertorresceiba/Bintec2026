import calendar
from collections import defaultdict
from collections.abc import Sequence

from app.modules.analitica.domain.entities import (
    CargoConsumo,
    ConsumoProducto,
    PeriodoInvalidoError,
    PeriodoUso,
    PuntoConsumo,
    SerieConsumo,
)

MESES: tuple[str, ...] = (
    "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
)  # fmt: skip
PRIMER_MES: int = 1
ULTIMO_MES: int = 12


def _clave(periodo: PeriodoUso, cargo: CargoConsumo) -> int:
    match periodo:
        case PeriodoUso.ANIO:
            return cargo.fecha.year
        case PeriodoUso.MES:
            return cargo.fecha.month
        case PeriodoUso.DIA:
            return cargo.fecha.day


def _claves(periodo: PeriodoUso, anio: int, mes: int | None, anios: Sequence[int]) -> list[int]:
    match periodo:
        case PeriodoUso.ANIO:
            return list(anios)
        case PeriodoUso.MES:
            return list(range(PRIMER_MES, ULTIMO_MES + 1))
        case PeriodoUso.DIA:
            assert mes is not None
            return list(range(1, calendar.monthrange(anio, mes)[1] + 1))


def _etiqueta(periodo: PeriodoUso, clave: int) -> str:
    return MESES[clave - 1] if periodo is PeriodoUso.MES else str(clave)


def construir_serie(
    periodo: PeriodoUso,
    anio: int,
    mes: int | None,
    cargos: Sequence[CargoConsumo],
    anios_disponibles: Sequence[int],
) -> SerieConsumo:
    """Servicio de dominio: agrupa los cargos por año, mes o día y por producto.

    - ANIO: un punto por cada año con historial (los años sin consumo valen 0).
    - MES: 12 puntos (Ene..Dic) del `anio` indicado.
    - DIA: un punto por cada día del `mes` del `anio` indicado.
    """
    if periodo is PeriodoUso.DIA and (mes is None or not PRIMER_MES <= mes <= ULTIMO_MES):
        raise PeriodoInvalidoError("Para consultar por día indica un mes entre 1 y 12")

    totales: dict[int, int] = defaultdict(int)
    cuentas: dict[int, int] = defaultdict(int)
    por_producto: dict[str, int] = defaultdict(int)
    for cargo in cargos:
        clave = _clave(periodo, cargo)
        totales[clave] += cargo.monto
        cuentas[clave] += 1
        por_producto[cargo.producto] += cargo.monto

    puntos = tuple(
        PuntoConsumo(
            clave=clave,
            etiqueta=_etiqueta(periodo, clave),
            total=totales[clave],
            transacciones=cuentas[clave],
        )
        for clave in _claves(periodo, anio, mes, anios_disponibles)
    )
    ranking = tuple(
        ConsumoProducto(producto=producto, total=total)
        for producto, total in sorted(por_producto.items(), key=lambda par: (-par[1], par[0]))
    )
    return SerieConsumo(
        periodo=periodo,
        anio=anio,
        mes=mes if periodo is PeriodoUso.DIA else None,
        puntos=puntos,
        por_producto=ranking,
        anios_disponibles=tuple(anios_disponibles),
    )
