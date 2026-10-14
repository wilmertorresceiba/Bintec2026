import secrets
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, timedelta
from uuid import uuid4

from app.modules.creditos.domain.oferta import (
    DIAS_PRIMERA_CUOTA,
    OFERTA_LIBRE_INVERSION,
    OfertaLibreInversion,
    crear_credito_desde_oferta,
)
from app.modules.creditos.domain.repositories import CreditoRepositorio
from app.modules.notificaciones.domain.entities import Notificacion, TipoNotificacion
from app.modules.notificaciones.domain.repositories import NotificacionRepositorio
from app.shared.domain.tiempo import ahora_utc
from app.shared.errors import RecursoNoEncontradoError

_DIGITOS_PRODUCTO: int = 10_000


def _obtener_propia(
    repositorio: NotificacionRepositorio, usuario_id: int, notificacion_id: str
) -> Notificacion:
    notificacion = repositorio.obtener(usuario_id, notificacion_id)
    if notificacion is None:
        # Mismo error si no existe o es de otro cliente (no se revela su existencia).
        raise RecursoNoEncontradoError("No encontramos la notificación solicitada")
    return notificacion


class ListarNotificaciones:
    """Caso de uso: notificaciones activas del cliente (acotadas a su propio usuario)."""

    def __init__(self, repositorio: NotificacionRepositorio) -> None:
        self._repositorio = repositorio

    def ejecutar(self, usuario_id: int) -> list[Notificacion]:
        return self._repositorio.listar_activas_por_usuario(usuario_id)


@dataclass(frozen=True, slots=True)
class DetalleOferta:
    monto: int
    cuotas: int
    tasa_mensual: float
    valor_cuota: int
    total_a_pagar: int
    fecha_primera_cuota: datetime


@dataclass(frozen=True, slots=True)
class DetalleNotificacion:
    notificacion: Notificacion
    oferta: DetalleOferta | None


class ObtenerDetalleNotificacion:
    """Caso de uso: detalle de una notificación; si es una oferta de crédito, sus condiciones."""

    def __init__(
        self,
        repositorio: NotificacionRepositorio,
        oferta: OfertaLibreInversion = OFERTA_LIBRE_INVERSION,
        reloj: Callable[[], datetime] = ahora_utc,
    ) -> None:
        self._repositorio = repositorio
        self._oferta = oferta
        self._reloj = reloj

    def ejecutar(self, usuario_id: int, notificacion_id: str) -> DetalleNotificacion:
        notificacion = _obtener_propia(self._repositorio, usuario_id, notificacion_id)
        if notificacion.tipo is not TipoNotificacion.CREDITO_PREAPROBADO:
            return DetalleNotificacion(notificacion, None)
        return DetalleNotificacion(
            notificacion,
            DetalleOferta(
                monto=self._oferta.monto,
                cuotas=self._oferta.cuotas,
                tasa_mensual=self._oferta.tasa_mensual,
                valor_cuota=self._oferta.valor_cuota,
                total_a_pagar=self._oferta.total_a_pagar,
                fecha_primera_cuota=self._reloj() + timedelta(days=DIAS_PRIMERA_CUOTA),
            ),
        )


class AceptarOfertaCredito:
    """Caso de uso: el cliente acepta el crédito preaprobado.

    Crea el crédito y cierra la notificación en una sola transacción: el repositorio de
    créditos solo hace flush y `guardar` confirma ambos cambios (o ninguno).
    """

    def __init__(
        self,
        notificaciones: NotificacionRepositorio,
        creditos: CreditoRepositorio,
        oferta: OfertaLibreInversion = OFERTA_LIBRE_INVERSION,
        reloj: Callable[[], datetime] = ahora_utc,
    ) -> None:
        self._notificaciones = notificaciones
        self._creditos = creditos
        self._oferta = oferta
        self._reloj = reloj

    def ejecutar(self, usuario_id: int, notificacion_id: str) -> Notificacion:
        aceptada = _obtener_propia(self._notificaciones, usuario_id, notificacion_id).aceptar()
        self._creditos.agregar(
            crear_credito_desde_oferta(
                credito_id=str(uuid4()),
                usuario_id=usuario_id,
                ultimos_digitos=f"{secrets.randbelow(_DIGITOS_PRODUCTO):04d}",
                oferta=self._oferta,
                ahora=self._reloj(),
            )
        )
        self._notificaciones.guardar(aceptada)
        return aceptada


class RechazarOfertaCredito:
    """Caso de uso: el cliente rechaza el crédito preaprobado (no se crea ningún crédito)."""

    def __init__(self, notificaciones: NotificacionRepositorio) -> None:
        self._notificaciones = notificaciones

    def ejecutar(self, usuario_id: int, notificacion_id: str) -> Notificacion:
        rechazada = _obtener_propia(self._notificaciones, usuario_id, notificacion_id).rechazar()
        self._notificaciones.guardar(rechazada)
        return rechazada
