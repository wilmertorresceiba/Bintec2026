from pydantic import EmailStr, Field

from app.shared.schemas import EsquemaCamel


class LoginSolicitud(EsquemaCamel):
    correo: EmailStr
    clave: str = Field(min_length=1, max_length=128)


class DesafioRespuesta(EsquemaCamel):
    """Paso 1 superado: falta el segundo factor (clave de cajero + código de seguridad)."""

    desafio: str
    requiere_segundo_factor: bool = True


class VerificacionSolicitud(EsquemaCamel):
    desafio: str = Field(min_length=20, max_length=2048)
    clave_cajero: str = Field(pattern=r"^\d{4}$")
    codigo_seguridad: str = Field(pattern=r"^\d{6}$")


class UsuarioRespuesta(EsquemaCamel):
    nombre: str
    correo: str


class SesionRespuesta(EsquemaCamel):
    token: str
    usuario: UsuarioRespuesta
