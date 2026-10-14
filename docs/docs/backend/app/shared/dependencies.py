"""Dependencias de FastAPI compartidas por todos los módulos."""

from collections.abc import Iterator

from fastapi import Request
from sqlalchemy.orm import Session

from app.shared.config import Settings


def get_settings(request: Request) -> Settings:
    settings: Settings = request.app.state.settings
    return settings


def get_session(request: Request) -> Iterator[Session]:
    with request.app.state.session_factory() as session:
        yield session
