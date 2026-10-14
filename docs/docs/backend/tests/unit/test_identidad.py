from datetime import UTC, datetime, timedelta

import pytest

from app.modules.identidad.application.iniciar_sesion import IniciarSesion
from app.modules.identidad.application.obtener_usuario_actual import ObtenerUsuarioActual
from app.modules.identidad.application.verificar_segundo_factor import VerificarSegundoFactor
from app.modules.identidad.domain.entities import Usuario
from app.modules.identidad.domain.exceptions import (
    CredencialesInvalidasError,
    CuentaBloqueadaError,
    DesafioInvalidoError,
    SegundoFactorInvalidoError,
    TokenInvalidoError,
)
from app.modules.identidad.domain.repositories import UsuarioRepositorio
from app.modules.identidad.infrastructure.seguridad import (
    CodigoSeguridadEstatico,
    EmisorTokensJwt,
    HasheadorScrypt,
)

HASHEADOR = HasheadorScrypt()
EMISOR = EmisorTokensJwt("secreto-de-pruebas-con-longitud-suficiente-32b", "HS256", 5, 5)
CODIGO = CodigoSeguridadEstatico("123456")
MAX_INTENTOS = 3
MINUTOS_BLOQUEO = 15
AHORA = datetime(2026, 10, 12, 12, 0, tzinfo=UTC)
CLAVE_HASH = HASHEADOR.hashear("Clave123*")
CAJERO_HASH = HASHEADOR.hashear("1381")


class RepositorioEnMemoria(UsuarioRepositorio):
    def __init__(self) -> None:
        self.usuario = Usuario(1, "Ana", "ana@bintec.com", CLAVE_HASH, CAJERO_HASH)

    def obtener_por_correo(self, correo: str) -> Usuario | None:
        return self.usuario if correo == self.usuario.correo else None

    def obtener_por_id(self, usuario_id: int) -> Usuario | None:
        return self.usuario if usuario_id == self.usuario.id else None

    def guardar(self, usuario: Usuario) -> None:
        self.usuario = usuario


def _paso1(repo: RepositorioEnMemoria, reloj: datetime = AHORA) -> IniciarSesion:
    return IniciarSesion(repo, HASHEADOR, EMISOR, MAX_INTENTOS, MINUTOS_BLOQUEO, lambda: reloj)


def _paso2(repo: RepositorioEnMemoria, reloj: datetime = AHORA) -> VerificarSegundoFactor:
    return VerificarSegundoFactor(
        repo, HASHEADOR, CODIGO, EMISOR, MAX_INTENTOS, MINUTOS_BLOQUEO, lambda: reloj
    )


# ---------------- Paso 1 ----------------
def test_paso1_correcto_entrega_un_desafio_y_no_una_sesion() -> None:
    desafio = _paso1(RepositorioEnMemoria()).ejecutar("  ANA@bintec.com ", "Clave123*").desafio
    assert EMISOR.validar_desafio(desafio) == 1
    with pytest.raises(TokenInvalidoError):  # un desafío NO sirve como token de acceso
        EMISOR.validar(desafio)


@pytest.mark.parametrize(
    ("correo", "clave"), [("ana@bintec.com", "mala"), ("otro@x.com", "Clave123*")]
)
def test_paso1_con_datos_incorrectos_falla_con_el_mismo_error(correo: str, clave: str) -> None:
    with pytest.raises(CredencialesInvalidasError):
        _paso1(RepositorioEnMemoria()).ejecutar(correo, clave)


def test_paso1_bloquea_la_cuenta_tras_el_maximo_de_intentos() -> None:
    repo = RepositorioEnMemoria()
    for _ in range(MAX_INTENTOS - 1):
        with pytest.raises(CredencialesInvalidasError):
            _paso1(repo).ejecutar("ana@bintec.com", "mala")
    with pytest.raises(CuentaBloqueadaError) as error:
        _paso1(repo).ejecutar("ana@bintec.com", "mala")
    assert "15 minuto" in str(error.value)
    # Bloqueada: ni siquiera la clave correcta entra
    with pytest.raises(CuentaBloqueadaError):
        _paso1(repo).ejecutar("ana@bintec.com", "Clave123*")


def test_paso1_el_bloqueo_expira_con_el_tiempo() -> None:
    repo = RepositorioEnMemoria()
    for _ in range(MAX_INTENTOS):
        with pytest.raises((CredencialesInvalidasError, CuentaBloqueadaError)):
            _paso1(repo).ejecutar("ana@bintec.com", "mala")
    despues = AHORA + timedelta(minutes=MINUTOS_BLOQUEO + 1)
    assert _paso1(repo, despues).ejecutar("ana@bintec.com", "Clave123*").desafio


# ---------------- Paso 2 ----------------
def _desafio(repo: RepositorioEnMemoria) -> str:
    return _paso1(repo).ejecutar("ana@bintec.com", "Clave123*").desafio


def test_paso2_correcto_emite_el_token_de_acceso() -> None:
    repo = RepositorioEnMemoria()
    sesion = _paso2(repo).ejecutar(_desafio(repo), "1381", "123456")
    assert EMISOR.validar(sesion.token) == 1
    assert sesion.usuario.nombre == "Ana"


@pytest.mark.parametrize(
    ("cajero", "codigo"), [("0000", "123456"), ("1381", "000000"), ("0000", "000000")]
)
def test_paso2_falla_igual_si_falla_cualquiera_de_los_dos_factores(
    cajero: str, codigo: str
) -> None:
    repo = RepositorioEnMemoria()
    with pytest.raises(SegundoFactorInvalidoError):
        _paso2(repo).ejecutar(_desafio(repo), cajero, codigo)


def test_paso2_bloquea_tras_el_maximo_de_intentos_y_un_exito_reinicia_el_contador() -> None:
    repo = RepositorioEnMemoria()
    desafio = _desafio(repo)
    for _ in range(MAX_INTENTOS - 1):
        with pytest.raises(SegundoFactorInvalidoError):
            _paso2(repo).ejecutar(desafio, "0000", "123456")
    # un acierto antes del bloqueo reinicia el contador
    _paso2(repo).ejecutar(desafio, "1381", "123456")
    assert repo.usuario.intentos_fallidos == 0

    for _ in range(MAX_INTENTOS - 1):
        with pytest.raises(SegundoFactorInvalidoError):
            _paso2(repo).ejecutar(desafio, "0000", "123456")
    with pytest.raises(CuentaBloqueadaError):
        _paso2(repo).ejecutar(desafio, "0000", "123456")
    with pytest.raises(CuentaBloqueadaError):  # y con los datos correctos tampoco
        _paso2(repo).ejecutar(desafio, "1381", "123456")


def test_paso2_rechaza_desafios_invalidos_expirados_o_de_otro_tipo() -> None:
    repo = RepositorioEnMemoria()
    for desafio in ("no.es.un.token", EMISOR.emitir(1)):  # el token de acceso tampoco vale
        with pytest.raises(DesafioInvalidoError):
            _paso2(repo).ejecutar(desafio, "1381", "123456")
    expirado = EmisorTokensJwt("secreto-de-pruebas-con-longitud-suficiente-32b", "HS256", 5, -1)
    with pytest.raises(DesafioInvalidoError):
        _paso2(repo).ejecutar(expirado.emitir_desafio(1), "1381", "123456")


# ---------------- Utilidades ----------------
def test_hash_no_guarda_la_clave_en_claro_y_usa_sal_distinta() -> None:
    primero, segundo = HASHEADOR.hashear("Clave123*"), HASHEADOR.hashear("Clave123*")
    assert "Clave123*" not in primero
    assert primero != segundo
    assert not HASHEADOR.verificar("Clave123*", "formato-invalido")


def test_token_manipulado_o_expirado_es_rechazado() -> None:
    with pytest.raises(TokenInvalidoError):
        EMISOR.validar("no.es.un.token")
    expirado = EmisorTokensJwt("secreto-de-pruebas-con-longitud-suficiente-32b", "HS256", -1)
    with pytest.raises(TokenInvalidoError):
        EMISOR.validar(expirado.emitir(1))


def test_obtener_usuario_actual_con_usuario_inexistente_falla() -> None:
    with pytest.raises(TokenInvalidoError):
        ObtenerUsuarioActual(RepositorioEnMemoria(), EMISOR).ejecutar(EMISOR.emitir(999))
