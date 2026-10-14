from datetime import UTC, datetime

import pytest

from app.modules.analitica.domain.entities import CargoConsumo, PeriodoInvalidoError, PeriodoUso
from app.modules.analitica.domain.servicio import construir_serie


def _cargo(anio: int, mes: int, dia: int, monto: int, producto: str = "Visa") -> CargoConsumo:
    return CargoConsumo(datetime(anio, mes, dia, 12, tzinfo=UTC), producto, monto)


CARGOS = [
    _cargo(2025, 3, 10, 100),
    _cargo(2025, 3, 10, 50, "Mastercard"),
    _cargo(2025, 3, 20, 200),
    _cargo(2026, 3, 5, 300),
]


def test_serie_por_anio_incluye_anios_sin_consumo() -> None:
    serie = construir_serie(PeriodoUso.ANIO, 2026, None, CARGOS, [2024, 2025, 2026])
    assert [(p.etiqueta, p.total) for p in serie.puntos] == [
        ("2024", 0),
        ("2025", 350),
        ("2026", 300),
    ]
    assert serie.total == 650
    assert serie.transacciones == 4
    assert serie.maximo is not None
    assert serie.maximo.etiqueta == "2025"
    assert serie.mes is None


def test_serie_por_mes_tiene_doce_puntos_con_etiquetas() -> None:
    serie = construir_serie(PeriodoUso.MES, 2025, None, CARGOS[:3], [2025])
    assert len(serie.puntos) == 12
    assert serie.puntos[0].etiqueta == "Ene"
    marzo = serie.puntos[2]
    assert (marzo.etiqueta, marzo.total, marzo.transacciones) == ("Mar", 350, 3)
    assert serie.promedio == round(350 / 12)


def test_serie_por_dia_usa_los_dias_reales_del_mes() -> None:
    febrero_bisiesto = construir_serie(PeriodoUso.DIA, 2024, 2, [], [2024])
    assert len(febrero_bisiesto.puntos) == 29
    marzo = construir_serie(PeriodoUso.DIA, 2025, 3, CARGOS[:3], [2025])
    assert len(marzo.puntos) == 31
    assert marzo.puntos[9].total == 150
    assert marzo.mes == 3


def test_ranking_por_producto_ordenado_de_mayor_a_menor() -> None:
    serie = construir_serie(PeriodoUso.ANIO, 2026, None, CARGOS, [2025, 2026])
    assert [(p.producto, p.total) for p in serie.por_producto] == [
        ("Visa", 600),
        ("Mastercard", 50),
    ]


def test_serie_sin_consumos_no_tiene_maximo() -> None:
    serie = construir_serie(PeriodoUso.MES, 2026, None, [], [2026])
    assert serie.total == 0
    assert serie.maximo is None


@pytest.mark.parametrize("mes", [None, 0, 13])
def test_por_dia_exige_un_mes_valido(mes: int | None) -> None:
    with pytest.raises(PeriodoInvalidoError):
        construir_serie(PeriodoUso.DIA, 2026, mes, [], [2026])
