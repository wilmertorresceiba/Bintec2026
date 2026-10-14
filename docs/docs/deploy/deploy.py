#!/usr/bin/env python3
"""Punto de entrada: python deploy.py {backend|frontend|iniciar|reiniciar|detener|estado|logs}."""

import sys

from bintec_deploy.cli import ejecutar

if __name__ == "__main__":
    sys.exit(ejecutar())
