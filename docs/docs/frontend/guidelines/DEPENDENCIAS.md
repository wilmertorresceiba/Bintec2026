# Dependencias, Scripts y Análisis de Dependencias

Este documento detalla todas las dependencias instaladas, su propósito, los scripts disponibles y cómo ejecutar y visualizar el análisis de dependencias del proyecto.

---

## Dependencias Principales

### Angular
- **@angular/core, @angular/common, @angular/forms, @angular/router, etc.**
  - Framework principal para el desarrollo de aplicaciones SPA. Proporciona la estructura, componentes, servicios y utilidades para construir aplicaciones robustas y escalables.
- **rxjs**
  - Librería para programación reactiva, esencial para el manejo de flujos asíncronos y eventos en Angular.
- **zone.js**
  - Permite el seguimiento de contextos de ejecución y es fundamental para el sistema de detección de cambios de Angular.

### Herramientas de Desarrollo
- **@angular/cli, @angular-devkit/build-angular, @angular/compiler-cli**
  - Utilidades CLI y herramientas de compilación para Angular. Permiten crear, construir, servir y testear la aplicación.
- **typescript**
  - Lenguaje principal del proyecto, provee tipado estático y herramientas avanzadas para el desarrollo seguro y mantenible.

### Linter y Formateo
- **eslint, angular-eslint, eslint-plugin-import, eslint-plugin-prettier, eslint-config-prettier, eslint-plugin-unused-imports, eslint-plugin-boundaries**
  - Herramientas para asegurar la calidad, consistencia y arquitectura del código. Permiten detectar errores, code smells y problemas de importación.
- **prettier**
  - Formateador de código automático para mantener un estilo consistente.

### Pruebas Unitarias
- **jasmine-core, @types/jasmine**
  - Framework de pruebas unitarias para JavaScript/TypeScript.
- **karma, karma-chrome-launcher, karma-jasmine, karma-jasmine-html-reporter, karma-coverage**
  - Herramientas para ejecutar pruebas unitarias en navegadores y generar reportes de cobertura.

### Pruebas de Integración y Componentes
- **cypress, @cypress/code-coverage, cypress-junit-reporter**
  - Cypress permite pruebas end-to-end y de componentes. El plugin de cobertura genera reportes de cobertura de código.

### Cobertura y Análisis
- **nyc, babel-plugin-istanbul**
  - Instrumentación y reporte de cobertura de código.
- **source-map-explorer, esbuild-visualizer**
  - Analizan el tamaño del bundle y visualizan la composición de los archivos generados.
- **madge**
  - Analiza las dependencias entre archivos y módulos, detecta ciclos y genera gráficos visuales de dependencias. **Requiere Graphviz instalado en el sistema para generar imágenes PNG.**
- **license-checker**
  - Audita las licencias de todas las dependencias instaladas.
- **audit-ci**
  - Audita vulnerabilidades de seguridad en las dependencias.
- **npm-check-updates (ncu)**
  - Verifica y sugiere actualizaciones de dependencias.

### Servidor Local
- **http-server**
  - Servidor HTTP simple para servir archivos estáticos, útil para visualizar reportes generados.

---

## Scripts de Análisis de Dependencias (Madge)

El proyecto incluye scripts para analizar y visualizar las dependencias entre módulos y archivos usando **madge**. Estos scripts generan imágenes PNG que muestran la estructura de dependencias de cada capa y detectan ciclos.

### Scripts Disponibles
- `npm run analyze:deps:all` — Genera un gráfico de todas las dependencias a partir de `src/main.ts`.
- `npm run analyze:deps:core` — Analiza solo la capa core.
- `npm run analyze:deps:shared` — Analiza solo la capa shared.
- `npm run analyze:deps:feature` — Analiza solo la capa feature.
- `npm run analyze:deps:layout` — Analiza solo la capa layout.
- `npm run analyze:deps:cycles` — Detecta ciclos de dependencias en el proyecto.

### Requisitos para Visualizar las Imágenes
- **madge** debe estar instalado (ya viene como devDependency).
- **Graphviz** debe estar instalado en el sistema operativo para que madge pueda generar imágenes PNG de los gráficos de dependencias.

#### Instalación de Graphviz según el sistema operativo:

- **Windows:**
  1. Descarga el instalador desde: https://graphviz.gitlab.io/_pages/Download/Download_windows.html
  2. Ejecuta el instalador y sigue los pasos.
  3. Agrega la ruta de instalación (por ejemplo, `C:\Program Files\Graphviz\bin`) a la variable de entorno `PATH` si no se agrega automáticamente.

- **macOS:**
  ```sh
  brew install graphviz
  ```

- **Linux (Debian/Ubuntu):**
  ```sh
  sudo apt-get update && sudo apt-get install graphviz
  ```

- **Linux (Fedora/RHEL):**
  ```sh
  sudo dnf install graphviz
  ```

- **Verifica la instalación ejecutando:**
  ```sh
  dot -V
  ```
  Debe mostrar la versión instalada de Graphviz.

### Configuración de Madge
- Madge utiliza el archivo `tsconfig.json` para entender los paths y la resolución de módulos TypeScript.
- Si modificas la estructura de carpetas o los paths en `tsconfig.json`, actualiza los scripts de madge en `package.json` para reflejar los nuevos paths.

---

## Scripts de Ejecución

### Desarrollo
- `npm start` — Inicia la aplicación en modo desarrollo con proxy y abre el navegador.
- `npm run build` — Compila la aplicación para producción.

### Pruebas Unitarias
- `npm test` — Ejecuta pruebas unitarias con cobertura.
- `npm run test:ci` — Pruebas unitarias en modo CI (headless).

### Pruebas de Componentes y E2E (Cypress)
- `npm run cypress` — Abre la interfaz de Cypress.
- `npm run cypress:component` — Abre pruebas de componentes en Cypress.
- `npm run test:component` — Ejecuta pruebas de componentes en modo headless y genera cobertura.
- `npm run e2e` — Ejecuta pruebas end-to-end.

### Lint y Formateo
- `npm run lint` — Ejecuta el linter (ESLint).
- `npm run lint:fix` — Corrige automáticamente los problemas de lint.
- `npm run format:test` — Verifica el formateo con Prettier.
- `npm run format:write` — Aplica el formateo con Prettier.

### Análisis y Auditoría
- `npm run analyze` — Analiza el bundle y genera visualización de dependencias.
- `npm run analyze:deps:*` — Analiza dependencias de cada capa (core, shared, feature, layout).
- `npm run analyze:deps:cycles` — Detecta ciclos de dependencias.
- `npm run deps:check` — Verifica actualizaciones de dependencias.
- `npm run audit:ci` — Ejecuta auditoría de seguridad.
- `npm run license-checker` — Verifica licencias de dependencias.

---

## Instalación de Dependencias

Ejecuta:
```sh
npm install
```
Esto instalará todas las dependencias necesarias para desarrollo, pruebas, análisis y visualización.

---

## Recomendaciones
- Antes de ejecutar los scripts de análisis, asegúrate de que el código compila correctamente.
- Revisa los gráficos generados para detectar dependencias no deseadas o ciclos.
- Consulta la documentación oficial de cada herramienta para configuraciones avanzadas.

---

Para dudas sobre una dependencia específica, revisa la documentación oficial o consulta con el equipo de desarrollo.
