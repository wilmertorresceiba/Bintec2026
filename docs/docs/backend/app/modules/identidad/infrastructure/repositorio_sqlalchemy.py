from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.identidad.domain.entities import Usuario
from app.modules.identidad.domain.repositories import UsuarioRepositorio
from app.modules.identidad.infrastructure.models import UsuarioModelo
from app.shared.domain.tiempo import como_utc


def _a_dominio(modelo: UsuarioModelo) -> Usuario:
    return Usuario(
        id=modelo.id,
        nombre=modelo.nombre,
        correo=modelo.correo,
        clave_hash=modelo.clave_hash,
        clave_cajero_hash=modelo.clave_cajero_hash,
        intentos_fallidos=modelo.intentos_fallidos,
        bloqueado_hasta=como_utc(modelo.bloqueado_hasta) if modelo.bloqueado_hasta else None,
    )


class UsuarioRepositorioSqlAlchemy(UsuarioRepositorio):
    def __init__(self, session: Session) -> None:
        self._session = session

    def obtener_por_correo(self, correo: str) -> Usuario | None:
        modelo = self._session.scalar(select(UsuarioModelo).where(UsuarioModelo.correo == correo))
        return _a_dominio(modelo) if modelo else None

    def obtener_por_id(self, usuario_id: int) -> Usuario | None:
        modelo = self._session.get(UsuarioModelo, usuario_id)
        return _a_dominio(modelo) if modelo else None

    def guardar(self, usuario: Usuario) -> None:
        modelo = self._session.get(UsuarioModelo, usuario.id)
        if modelo is None:
            return
        modelo.intentos_fallidos = usuario.intentos_fallidos
        modelo.bloqueado_hasta = (
            usuario.bloqueado_hasta.replace(tzinfo=None) if usuario.bloqueado_hasta else None
        )
        self._session.commit()
