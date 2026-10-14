"""Infraestructura de base de datos compartida (SQLAlchemy 2 + SQLite)."""

from pathlib import Path
from typing import Any

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class Base(DeclarativeBase):
    """Base declarativa común a los modelos de todos los módulos."""


def crear_engine(url: str) -> Engine:
    es_sqlite: bool = url.startswith("sqlite")
    if es_sqlite:
        archivo: str | None = make_url(url).database
        if archivo and archivo != ":memory:":
            Path(archivo).parent.mkdir(parents=True, exist_ok=True)
    engine: Engine = create_engine(
        url, connect_args={"check_same_thread": False} if es_sqlite else {}
    )
    if es_sqlite:

        @event.listens_for(engine, "connect")
        def _activar_llaves_foraneas(conexion: Any, _registro: Any) -> None:
            cursor = conexion.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    return engine


def crear_session_factory(engine: Engine) -> sessionmaker[Session]:
    return sessionmaker(bind=engine, expire_on_commit=False)
