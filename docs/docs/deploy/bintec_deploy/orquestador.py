"""Casos de uso: iniciar, detener, reiniciar, consultar el estado y ver los logs."""

from __future__ import annotations

from collections.abc import Sequence
from pathlib import Path

from bintec_deploy import servicios
from bintec_deploy.config import (
    BACKEND,
    FRONTEND,
    ORDEN_DETENCION,
    ORDEN_INICIO,
    Config,
    Servicio,
)
from bintec_deploy.consola import Consola
from bintec_deploy.registro import RegistroPids
from bintec_deploy.sistema import ErrorSistema, Sistema

ESPERA_LIBERAR_PUERTO: int = 15  # segundos
LINEAS_LOG_EN_ERROR: int = 15


def _filtrar(orden: Sequence[str], objetivos: Sequence[str]) -> list[str]:
    return [nombre for nombre in orden if nombre in objetivos]


class Orquestador:
    def __init__(
        self,
        config: Config,
        sistema: Sistema,
        consola: Consola,
        registro: RegistroPids | None = None,
    ) -> None:
        self._config = config
        self._sistema = sistema
        self._consola = consola
        self._registro = registro or RegistroPids(config.dir_run)

    # ------------------------------------------------------------------ iniciar
    def iniciar(
        self,
        objetivos: Sequence[str],
        *,
        abrir_navegador: bool = False,
        forzar: bool = False,
        preparar: bool = True,
    ) -> int:
        """Inicia los servicios pedidos; el backend siempre antes que el frontend."""
        for nombre in _filtrar(ORDEN_INICIO, objetivos):
            if not self._iniciar_uno(
                self._config.servicio(nombre), abrir_navegador, forzar, preparar, objetivos
            ):
                return 1
        return 0

    def _iniciar_uno(
        self,
        servicio: Servicio,
        abrir_navegador: bool,
        forzar: bool,
        preparar: bool,
        objetivos: Sequence[str],
    ) -> bool:
        nombre = servicio.nombre
        registro = self._registro.leer(nombre)
        if registro and self._sistema.esta_vivo(registro.pid):
            if self._sistema.responde(servicio.url_salud):
                self._consola.ok(
                    f"{nombre} ya está corriendo (PID {registro.pid}, puerto {servicio.puerto})."
                )
                return True
            self._consola.error(
                f"{nombre} está activo (PID {registro.pid}) pero no responde. "
                f"Usa `reiniciar {nombre}` para relanzarlo."
            )
            return False
        if registro:
            self._registro.borrar(nombre)  # registro huérfano: el proceso ya no existe

        if self._sistema.puerto_abierto(servicio.puerto) and not self._liberar_puerto(servicio, forzar):
            return False

        if nombre == FRONTEND and BACKEND not in objetivos and not self._backend_activo():
            self._consola.aviso(
                "El backend no está activo: el login y los datos fallarán hasta que lo inicies "
                "(`deploy.py backend`)."
            )

        try:
            if preparar:
                servicios.preparar(servicio, self._sistema, self._consola.info)
            comando = servicios.comando_de(servicio, self._sistema, abrir_navegador)
        except ErrorSistema as error:
            self._consola.error(str(error))
            return False

        log = self._config.dir_logs / f"{nombre}.log"
        self._consola.info(f"Iniciando {nombre} ({servicio.descripcion}) en el puerto {servicio.puerto}…")
        pid = self._sistema.lanzar(comando, servicio.directorio, log, servicios.entorno(nombre))
        self._registro.guardar(nombre, pid, servicio.puerto, comando)
        return self._esperar_salud(servicio, pid, log)

    def _backend_activo(self) -> bool:
        return self._sistema.responde(self._config.backend.url_salud)

    def _liberar_puerto(self, servicio: Servicio, forzar: bool) -> bool:
        """El puerto está ocupado por un proceso que NO lanzó deploy.py."""
        pid = self._sistema.pid_en_puerto(servicio.puerto)
        quien = f"PID {pid}" if pid else "un proceso desconocido"
        if not forzar:
            self._consola.error(
                f"El puerto {servicio.puerto} ya está en uso por {quien} (no lo inició deploy.py). "
                "Deténlo tú, o repite el comando con --forzar para que lo cierre."
            )
            return False
        if pid is None:
            self._consola.error(f"No pude identificar quién usa el puerto {servicio.puerto}.")
            return False
        self._consola.aviso(f"--forzar: cerrando {quien} que ocupa el puerto {servicio.puerto}…")
        self._sistema.terminar_arbol(pid)
        return self._esperar_puerto_libre(servicio)

    def _esperar_salud(self, servicio: Servicio, pid: int, log: Path) -> bool:
        limite = self._sistema.ahora() + servicio.timeout_salud
        while self._sistema.ahora() < limite:
            if not self._sistema.esta_vivo(pid):
                self._registro.borrar(servicio.nombre)
                self._consola.error(f"{servicio.nombre} se cerró al arrancar. Últimas líneas del log:")
                for linea in self._cola_log(log, LINEAS_LOG_EN_ERROR):
                    self._consola.linea(f"      {linea}")
                return False
            if self._sistema.responde(servicio.url_salud):
                self._consola.ok(f"{servicio.nombre} listo: {servicio.url_salud} (PID {pid}). Log: {log}")
                return True
            self._sistema.dormir(1)
        self._consola.error(
            f"{servicio.nombre} no respondió en {servicio.timeout_salud} s. Revisa el log: {log}"
        )
        return False

    # ------------------------------------------------------------------ detener
    def detener(self, objetivos: Sequence[str], *, forzar: bool = False) -> int:
        """Detiene los servicios pedidos (primero el frontend, después el backend)."""
        codigo = 0
        for nombre in _filtrar(ORDEN_DETENCION, objetivos):
            if not self._detener_uno(self._config.servicio(nombre), forzar):
                codigo = 1
        return codigo

    def _detener_uno(self, servicio: Servicio, forzar: bool) -> bool:
        nombre = servicio.nombre
        registro = self._registro.leer(nombre)
        if registro and self._sistema.esta_vivo(registro.pid):
            self._consola.info(f"Deteniendo {nombre} (PID {registro.pid})…")
            self._sistema.terminar_arbol(registro.pid)
        self._registro.borrar(nombre)

        if self._sistema.puerto_abierto(servicio.puerto):
            if not forzar:
                pid = self._sistema.pid_en_puerto(servicio.puerto)
                quien = f"PID {pid}" if pid else "otro proceso"
                self._consola.aviso(
                    f"El puerto {servicio.puerto} sigue ocupado por {quien} (no lo inició deploy.py). "
                    "Usa --forzar para cerrarlo."
                )
                return registro is not None
            pid = self._sistema.pid_en_puerto(servicio.puerto)
            if pid is not None:
                self._consola.aviso(f"--forzar: cerrando PID {pid} en el puerto {servicio.puerto}…")
                self._sistema.terminar_arbol(pid)
            if not self._esperar_puerto_libre(servicio):
                return False
        elif registro is None:
            self._consola.info(f"{nombre} ya estaba detenido.")
            return True
        self._consola.ok(f"{nombre} detenido.")
        return True

    def _esperar_puerto_libre(self, servicio: Servicio) -> bool:
        limite = self._sistema.ahora() + ESPERA_LIBERAR_PUERTO
        while self._sistema.ahora() < limite:
            if not self._sistema.puerto_abierto(servicio.puerto):
                return True
            self._sistema.dormir(0.5)
        self._consola.error(f"El puerto {servicio.puerto} no se liberó a tiempo.")
        return False

    # ----------------------------------------------------------------- reiniciar
    def reiniciar(
        self,
        objetivos: Sequence[str],
        *,
        abrir_navegador: bool = False,
        forzar: bool = False,
        preparar: bool = True,
    ) -> int:
        self._consola.info("Reiniciando: primero se detiene y luego se inicia en orden.")
        self.detener(objetivos, forzar=forzar)
        return self.iniciar(objetivos, abrir_navegador=abrir_navegador, forzar=forzar, preparar=preparar)

    # -------------------------------------------------------------------- estado
    def estado(self) -> int:
        self._consola.linea(f"{'SERVICIO':<10} {'ESTADO':<22} {'PID':<8} {'PUERTO':<7} URL")
        for nombre in ORDEN_INICIO:
            servicio = self._config.servicio(nombre)
            registro = self._registro.leer(nombre)
            gestionado = bool(registro and self._sistema.esta_vivo(registro.pid))
            abierto = self._sistema.puerto_abierto(servicio.puerto)
            if gestionado and self._sistema.responde(servicio.url_salud):
                estado = "corriendo"
            elif gestionado:
                estado = "iniciando / sin respuesta"
            elif abierto:
                estado = "en uso (externo)"
            else:
                estado = "detenido"
            pid = registro.pid if gestionado and registro else self._sistema.pid_en_puerto(servicio.puerto)
            self._consola.linea(
                f"{nombre:<10} {estado:<22} {pid if pid else '-':<8} {servicio.puerto:<7} {servicio.url_salud}"
            )
        return 0

    # ---------------------------------------------------------------------- logs
    def logs(self, nombre: str, lineas: int) -> int:
        ruta = self._config.dir_logs / f"{nombre}.log"
        if not ruta.exists():
            self._consola.aviso(f"Aún no hay log de {nombre}: {ruta}")
            return 1
        for linea in self._cola_log(ruta, lineas):
            self._consola.linea(linea)
        return 0

    @staticmethod
    def _cola_log(ruta: Path, lineas: int) -> list[str]:
        try:
            texto = ruta.read_text(encoding="utf-8", errors="replace")
        except OSError:
            return []
        return texto.splitlines()[-lineas:]
