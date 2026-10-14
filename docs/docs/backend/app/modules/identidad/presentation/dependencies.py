from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.modules.identidad.application.iniciar_sesion import IniciarSesion
from app.modules.identidad.application.obtener_usuario_actual import ObtenerUsuarioActual
from app.modules.identidad.application.verificar_segundo_factor import VerificarSegundoFactor
from app.modules.identidad.domain.entities import Usuario
from app.modules.identidad.domain.exceptions import TokenInvalidoError
from app.modules.identidad.infrastructure.repositorio_sqlalchemy import (
    UsuarioRepositorioSqlAlchemy,
)
from app.modules.identidad.infrastructure.seguridad import (
    CodigoSeguridadEstatico,
    EmisorTokensJwt,
    HasheadorScrypt,
)
from app.shared.config import Settings
from app.shared.dependencies import get_session, get_settings

_esquema_bearer = HTTPBearer(auto_error=False)

SessionDep = Annotated[Session, Depends(get_session)]
SettingsDep = Annotated[Settings, Depends(get_settings)]


def _emisor(settings: Settings) -> EmisorTokensJwt:
    return EmisorTokensJwt(
        settings.jwt_secret,
        settings.jwt_algoritmo,
        settings.jwt_expiracion_minutos,
        settings.desafio_expiracion_minutos,
    )


def obtener_iniciar_sesion(session: SessionDep, settings: SettingsDep) -> IniciarSesion:
    return IniciarSesion(
        UsuarioRepositorioSqlAlchemy(session),
        HasheadorScrypt(),
        _emisor(settings),
        settings.max_intentos_fallidos,
        settings.minutos_bloqueo,
    )


def obtener_verificar_segundo_factor(
    session: SessionDep, settings: SettingsDep
) -> VerificarSegundoFactor:
    return VerificarSegundoFactor(
        UsuarioRepositorioSqlAlchemy(session),
        HasheadorScrypt(),
        CodigoSeguridadEstatico(settings.codigo_seguridad_demo),
        _emisor(settings),
        settings.max_intentos_fallidos,
        settings.minutos_bloqueo,
    )


def usuario_actual(
    credenciales: Annotated[HTTPAuthorizationCredentials | None, Depends(_esquema_bearer)],
    session: SessionDep,
    settings: SettingsDep,
) -> Usuario:
    """Dependencia pública del módulo: exige un Bearer token de ACCESO válido."""
    if credenciales is None:
        raise TokenInvalidoError
    caso = ObtenerUsuarioActual(UsuarioRepositorioSqlAlchemy(session), _emisor(settings))
    return caso.ejecutar(credenciales.credentials)


UsuarioActual = Annotated[Usuario, Depends(usuario_actual)]
