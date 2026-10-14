from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.modules.analitica.application.obtener_consumo import ObtenerConsumo
from app.modules.analitica.domain.entities import PeriodoUso, SerieConsumo
from app.modules.analitica.presentation.dependencies import obtener_consumo
from app.modules.analitica.presentation.schemas import SerieConsumoRespuesta
from app.modules.identidad.presentation.dependencies import UsuarioActual
from app.shared.domain.tiempo import ahora_utc

router = APIRouter(prefix="/analitica", tags=["Analítica de uso"])


@router.get("/consumo", response_model=SerieConsumoRespuesta)
def consultar_consumo(
    usuario: UsuarioActual,
    caso: Annotated[ObtenerConsumo, Depends(obtener_consumo)],
    periodo: PeriodoUso = PeriodoUso.MES,
    anio: Annotated[int | None, Query(ge=2000, le=2100)] = None,
    mes: Annotated[int | None, Query(ge=1, le=12)] = None,
) -> SerieConsumo:
    """Consumo con tarjetas agrupado por `periodo`.

    - `anio`: serie anual (todos los años con historial)
    - `mes`: los 12 meses del `anio` indicado (por defecto el actual)
    - `dia`: los días del `mes` del `anio` indicados (por defecto el actual)
    """
    hoy = ahora_utc()
    return caso.ejecutar(
        usuario.id,
        periodo,
        anio or hoy.year,
        (mes or hoy.month) if periodo is PeriodoUso.DIA else None,
    )
