"""Errores de dominio y su traducción a respuestas HTTP."""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class DomainError(Exception):
    """Error de negocio. Cada subclase define un `codigo` estable para el cliente."""

    codigo: str = "error_dominio"

    def __init__(self, mensaje: str) -> None:
        super().__init__(mensaje)
        self.mensaje: str = mensaje


class RecursoNoEncontradoError(DomainError):
    codigo = "no_encontrado"


ESTADO_HTTP_POR_CODIGO: dict[str, int] = {
    "credenciales_invalidas": 401,
    "token_invalido": 401,
    "segundo_factor_invalido": 401,
    "desafio_invalido": 401,
    "cuenta_bloqueada": 423,
    "no_encontrado": 404,
    "notificacion_resuelta": 409,
}


def registrar_manejadores(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def _manejar_error_dominio(_: Request, error: DomainError) -> JSONResponse:
        estado: int = ESTADO_HTTP_POR_CODIGO.get(error.codigo, 400)
        return JSONResponse(
            status_code=estado,
            content={"detail": error.mensaje, "code": error.codigo},
        )
