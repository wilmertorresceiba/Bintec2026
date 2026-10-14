from typing import Annotated

from fastapi import APIRouter, Depends

from app.modules.identidad.application.iniciar_sesion import (
    DesafioDTO,
    IniciarSesion,
    SesionDTO,
)
from app.modules.identidad.application.verificar_segundo_factor import VerificarSegundoFactor
from app.modules.identidad.domain.entities import Usuario
from app.modules.identidad.presentation.dependencies import (
    UsuarioActual,
    obtener_iniciar_sesion,
    obtener_verificar_segundo_factor,
)
from app.modules.identidad.presentation.schemas import (
    DesafioRespuesta,
    LoginSolicitud,
    SesionRespuesta,
    UsuarioRespuesta,
    VerificacionSolicitud,
)

router = APIRouter(prefix="/auth", tags=["Identidad"])


@router.post("/login", response_model=DesafioRespuesta)
def iniciar_sesion(
    solicitud: LoginSolicitud,
    caso: Annotated[IniciarSesion, Depends(obtener_iniciar_sesion)],
) -> DesafioDTO:
    """Paso 1: correo y clave. No entrega sesión, solo un desafío para el segundo factor."""
    return caso.ejecutar(solicitud.correo, solicitud.clave)


@router.post("/verificar", response_model=SesionRespuesta)
def verificar_segundo_factor(
    solicitud: VerificacionSolicitud,
    caso: Annotated[VerificarSegundoFactor, Depends(obtener_verificar_segundo_factor)],
) -> SesionDTO:
    """Paso 2: clave de cajero (4 dígitos) y código de seguridad (6 dígitos). Entrega la sesión."""
    return caso.ejecutar(solicitud.desafio, solicitud.clave_cajero, solicitud.codigo_seguridad)


@router.get("/me", response_model=UsuarioRespuesta)
def usuario_en_sesion(usuario: UsuarioActual) -> Usuario:
    return usuario
