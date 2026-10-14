"""Datos de demostración del taller.

Uso:  python -m app.seed [--reset]
Las fechas se calculan relativas al momento de la siembra, para que la demo se vea vigente.
"""

import argparse
import random
from collections.abc import Callable
from datetime import datetime, timedelta
from uuid import uuid4

from sqlalchemy import Engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.modules.creditos.domain.oferta import OFERTA_LIBRE_INVERSION
from app.modules.creditos.infrastructure.models import CreditoModelo
from app.modules.cuentas.infrastructure.models import CuentaAhorroModelo
from app.modules.identidad.infrastructure.models import UsuarioModelo
from app.modules.identidad.infrastructure.seguridad import HasheadorScrypt
from app.modules.movimientos.infrastructure.models import MovimientoModelo
from app.modules.notificaciones.infrastructure.models import NotificacionModelo
from app.modules.tarjetas.infrastructure.models import TarjetaModelo
from app.shared.config import get_settings
from app.shared.database import Base, crear_engine, crear_session_factory
from app.shared.domain.tiempo import ahora_utc

CORREO_DEMO: str = "wilmer.torres@ceiba.com.co"
CLAVE_DEMO: str = "Demo2026*"
CLAVE_CAJERO_DEMO: str = "1381"
NOMBRE_DEMO: str = "Wilmer Torres"


COMERCIOS: tuple[str, ...] = (
    "Supermercado Éxito", "Restaurante El Cielo", "Farmacia Cruz Verde",
    "Estación de servicio Terpel",
    "Netflix", "Spotify", "Rappi", "Cine Colombia", "Librería Panamericana", "Uber", "Falabella",
    "Homecenter", "Claro", "Tienda D1", "Cafetería Juan Valdez",
)  # fmt: skip
PRODUCTOS_CONSUMO: tuple[tuple[str, int], ...] = (
    ("Visa Oro •••• 4821", 60),
    ("Mastercard •••• 9034", 40),
)
ANIOS_HISTORIAL: int = 3
DIAS_RECIENTES_MANUALES: int = 10


def generar_historial(uid: int, base: datetime) -> list[MovimientoModelo]:
    """Consumos sintéticos y deterministas de ~3 años para las gráficas de uso.

    Hay estacionalidad (diciembre pesa más), una tendencia de crecimiento anual y
    algún avance en efectivo esporádico. Termina antes de los movimientos manuales recientes.
    """
    rng = random.Random(2026)
    nombres, pesos = zip(*PRODUCTOS_CONSUMO, strict=True)
    movimientos: list[MovimientoModelo] = []
    for dias_atras in range(ANIOS_HISTORIAL * 365, DIAS_RECIENTES_MANUALES, -1):
        fecha = base - timedelta(days=dias_atras)
        factor = 1.5 if fecha.month == 12 else 1.0
        factor *= 1 + 0.12 * (base.year - fecha.year == 0) + 0.06 * (base.year - fecha.year == 1)
        for _ in range(rng.choices((0, 1, 2, 3), weights=(35, 35, 20, 10))[0]):
            es_avance = rng.random() < 0.04
            monto = round(rng.randint(15_000, 420_000) * factor, -2)
            movimientos.append(
                MovimientoModelo(
                    id=_id(),
                    usuario_id=uid,
                    fecha=fecha.replace(hour=rng.randint(7, 22), minute=rng.randint(0, 59)),
                    descripcion="Avance en cajero" if es_avance else rng.choice(COMERCIOS),
                    producto=rng.choices(nombres, weights=pesos)[0],
                    tipo="AVANCE" if es_avance else "COMPRA",
                    valor=-int(monto * (1.4 if es_avance else 1)),
                )
            )
    return movimientos


def _id() -> str:
    return str(uuid4())


def sembrar(session: Session, ahora: datetime | None = None) -> bool:
    """Inserta el cliente demo y sus productos. Devuelve False si ya había datos."""
    if session.scalar(select(UsuarioModelo.id).limit(1)) is not None:
        return False

    base: datetime = (ahora or ahora_utc()).replace(tzinfo=None)
    en: Callable[[int], datetime] = lambda dias: base + timedelta(days=dias)  # noqa: E731

    usuario = UsuarioModelo(
        nombre=NOMBRE_DEMO,
        correo=CORREO_DEMO,
        clave_hash=HasheadorScrypt().hashear(CLAVE_DEMO),
        clave_cajero_hash=HasheadorScrypt().hashear(CLAVE_CAJERO_DEMO),
    )
    session.add(usuario)
    session.flush()
    uid: int = usuario.id

    session.add_all(
        [
            CuentaAhorroModelo(
                id=_id(),
                usuario_id=uid,
                tipo="Cuenta de Ahorros",
                ultimos_digitos="5538",
                saldo_total=4_850_000,
                saldo_disponible=4_720_000,
                rendimientos_mes=8_450,
                tasa_efectiva_anual=1.5,
                fecha_apertura=en(-1460),
                estado="ACTIVA",
            ),
            CuentaAhorroModelo(
                id=_id(),
                usuario_id=uid,
                tipo="Ahorro Programado",
                ultimos_digitos="7021",
                saldo_total=12_300_000,
                saldo_disponible=12_300_000,
                rendimientos_mes=48_200,
                tasa_efectiva_anual=4.8,
                fecha_apertura=en(-540),
                estado="ACTIVA",
            ),
            TarjetaModelo(
                id=_id(),
                usuario_id=uid,
                marca="VISA",
                nombre="Visa Oro",
                ultimos_digitos="4821",
                cupo_total=8_000_000,
                cupo_utilizado=3_250_000,
                pago_minimo=325_000,
                pago_total=3_250_000,
                fecha_limite_pago=en(6),
                estado="AL_DIA",
            ),
            TarjetaModelo(
                id=_id(),
                usuario_id=uid,
                marca="MASTERCARD",
                nombre="Mastercard Platinum",
                ultimos_digitos="9034",
                cupo_total=15_000_000,
                cupo_utilizado=13_100_000,
                pago_minimo=1_310_000,
                pago_total=13_100_000,
                fecha_limite_pago=en(2),
                estado="AL_DIA",
            ),
            CreditoModelo(
                id=_id(),
                usuario_id=uid,
                tipo="Vehículo",
                ultimos_digitos="7745",
                monto_original=58_000_000,
                saldo_capital=41_900_000,
                valor_cuota=1_540_000,
                cuotas_pagadas=20,
                cuotas_totales=60,
                tasa_mensual=1.18,
                proximo_pago=en(14),
                estado="AL_DIA",
            ),
            CreditoModelo(
                id=_id(),
                usuario_id=uid,
                tipo="Vivienda",
                ultimos_digitos="3382",
                monto_original=210_000_000,
                saldo_capital=187_500_000,
                valor_cuota=2_380_000,
                cuotas_pagadas=24,
                cuotas_totales=240,
                tasa_mensual=0.89,
                proximo_pago=en(21),
                estado="EN_MORA",
            ),
        ]
    )

    movimientos: list[tuple[int, str, str, str, int]] = [
        (-1, "Supermercado Éxito", "Visa Oro •••• 4821", "COMPRA", -286_400),
        (-2, "Pago cuota crédito de vehículo", "Crédito •••• 7745", "CUOTA_CREDITO", -1_540_000),
        (-3, "Netflix", "Mastercard •••• 9034", "COMPRA", -44_900),
        (-5, "Abono a tarjeta", "Visa Oro •••• 4821", "PAGO", 900_000),
        (-6, "Avance en cajero", "Mastercard •••• 9034", "AVANCE", -500_000),
        (-10, "Restaurante El Cielo", "Visa Oro •••• 4821", "COMPRA", -212_000),
    ]
    session.add_all(
        MovimientoModelo(
            id=_id(),
            usuario_id=uid,
            fecha=en(dias),
            descripcion=descripcion,
            producto=producto,
            tipo=tipo,
            valor=valor,
        )
        for dias, descripcion, producto, tipo, valor in movimientos
    )
    monto_oferta = f"{OFERTA_LIBRE_INVERSION.monto:,}".replace(",", ".")
    session.add(
        NotificacionModelo(
            id=_id(),
            usuario_id=uid,
            tipo="CREDITO_PREAPROBADO",
            titulo="Crédito preaprobado",
            mensaje=(
                "Tienes un crédito preaprobado de libre inversión por "
                f"${monto_oferta} a {OFERTA_LIBRE_INVERSION.cuotas} cuotas."
            ),
            fecha=en(0),
            estado="PENDIENTE",
        )
    )
    session.add_all(generar_historial(uid, base))
    session.commit()
    return True


def preparar_base_de_datos(
    engine: Engine, factory: sessionmaker[Session], sembrar_datos: bool
) -> None:
    """Crea el esquema (todos los modelos ya están importados arriba) y siembra si está vacío."""
    Base.metadata.create_all(engine)
    if sembrar_datos:
        with factory() as session:
            sembrar(session)


def _principal() -> None:
    parser = argparse.ArgumentParser(description="Siembra la base de datos demo")
    parser.add_argument("--reset", action="store_true", help="Borra y recrea todas las tablas")
    argumentos = parser.parse_args()

    engine = crear_engine(get_settings().database_url)
    if argumentos.reset:
        Base.metadata.drop_all(engine)
    preparar_base_de_datos(engine, crear_session_factory(engine), sembrar_datos=True)
    print(f"Base de datos lista: {engine.url}")  # noqa: T201


if __name__ == "__main__":
    _principal()
