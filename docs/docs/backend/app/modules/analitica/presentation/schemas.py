from app.shared.schemas import EsquemaCamel


class PuntoConsumoRespuesta(EsquemaCamel):
    clave: int
    etiqueta: str
    total: int
    transacciones: int


class ConsumoProductoRespuesta(EsquemaCamel):
    producto: str
    total: int


class SerieConsumoRespuesta(EsquemaCamel):
    periodo: str
    anio: int
    mes: int | None
    total: int
    promedio: int
    transacciones: int
    maximo: PuntoConsumoRespuesta | None
    puntos: list[PuntoConsumoRespuesta]
    por_producto: list[ConsumoProductoRespuesta]
    anios_disponibles: list[int]
