"""Esquemas base: el contrato JSON usa camelCase (coincide con el frontend Angular)."""

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class EsquemaCamel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)
