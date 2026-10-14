# Bintec Banca en línea - Estándares de Código

## Información General

### Propósito del Documento

Este documento define los estándares de código obligatorios y recomendados para el desarrollo en Bintec Banca en línea (frontend Angular 20 + backend FastAPI). Garantizan consistencia, legibilidad y mantenibilidad del código.

- **Audiencia**: Desarrolladores, Code Reviewers
- **Última Actualización**: 2026-10-12
- **Estado**: Activo

---

## Estándares Obligatorios

### 1. Nomenclatura

#### Variables y Funciones

```typescript
// ✅ CORRECTO (frontend: camelCase, tipos explícitos, constantes UPPER_CASE sin números mágicos)
const UMBRAL_USO_ALTO: number = 80;
public readonly usoAlto: Signal<boolean> = computed<boolean>(
  () => this.porcentajeUso() >= UMBRAL_USO_ALTO
);

// ❌ INCORRECTO (regla no-magic-numbers + typedef; sin ejemplo real en el repo)
const uso = this.porcentajeUso() >= 80;
```

```python
# ✅ CORRECTO (backend: snake_case, constantes privadas _UPPER_CASE, anotaciones completas)
_LONGITUD_ULTIMOS_DIGITOS: int = 4

@property
def cupo_disponible(self) -> int:
    return self.cupo_total - self.cupo_utilizado

# ❌ INCORRECTO (mypy strict exige anotaciones; ruff/pyflakes) (sin ejemplo real disponible)
def cupoDisponible(self): return self.cupo_total - self.cupo_utilizado
```

#### Clases y Componentes

```typescript
// ✅ CORRECTO: PascalCase, selector con prefijo `app-` en kebab-case, standalone + OnPush
@Component({
  selector: 'app-tarjeta-credito',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, BarraProgresoComponent],
})
export class TarjetaCreditoComponent { /* ... */ }

// ❌ INCORRECTO: selector sin prefijo `app`, sin OnPush (sin ejemplo real disponible)
@Component({ selector: 'tarjetaCredito' })
export class tarjetaCredito {}
```

```python
# ✅ CORRECTO: clases PascalCase en español de dominio; excepciones terminan en Error con `codigo`
class TarjetaInvalidaError(DomainError):
    codigo = "tarjeta_invalida"

@dataclass(frozen=True, slots=True)
class TarjetaCredito: ...
```

#### Archivos y Directorios

```
Frontend (kebab-case, sufijo por tipo):
  tarjeta-credito/tarjeta-credito.component.{ts,html,scss,spec.ts}
  dashboard.service.ts · autenticacion.interceptor.ts · seguridad.guard.ts · dashboard.routes.ts
  Pruebas: *.spec.ts (Karma/Jasmine) · fixtures en feature/<x>/shared/testing/*.fixture.ts
Backend (snake_case, un caso de uso por archivo):
  app/modules/tarjetas/{domain/entities.py, application/listar_tarjetas.py,
                        infrastructure/repositorio_sqlalchemy.py, presentation/router.py}
  tests/unit/test_<tema>.py · tests/integration/test_<tema>.py
```

Idioma: nombres de dominio, métodos y mensajes en **español**; sufijos técnicos del framework en inglés (`Component`, `Service`, `router`).

### 2. Estructura de Código

#### Organización de Imports

```typescript
// ✅ CORRECTO (import/order: external → alias internos, alfabético, sin líneas en blanco entre grupos)
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ETIQUETAS_ESTADO } from '@feature/dashboard/shared/constants/etiquetas-estado';
import { TarjetaCredito } from '@feature/dashboard/shared/interfaces/dashboard';
import { BarraProgresoComponent } from '@shared/components/barra-progreso/barra-progreso.component';
```

```python
# ✅ CORRECTO (ruff "I": stdlib → terceros → app, separados por línea en blanco)
from typing import Annotated

from fastapi import APIRouter, Depends

from app.modules.identidad.presentation.dependencies import UsuarioActual
```

Usar los alias `@core`, `@shared`, `@feature`, `@layout`, `@env` (tsconfig); no rutas relativas que crucen capas.

#### Estructura de Funciones

```typescript
// ✅ CORRECTO: miembros públicos explícitos, inyección con inject(), retorno tipado
@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http: HttpService = inject(HttpService);

  public obtenerTarjetas(): Observable<TarjetaCredito[]> {
    return this.http.doGet<TarjetaCredito[]>(`${environment.endpoint}/tarjetas`);
  }
}
```

```python
# ✅ CORRECTO: caso de uso = clase con dependencias por constructor (puerto) y `ejecutar`
class ListarTarjetas:
    def __init__(self, repositorio: TarjetaRepositorio) -> None:
        self._repositorio = repositorio

    def ejecutar(self, usuario_id: int) -> list[TarjetaCredito]:
        return self._repositorio.listar_por_usuario(usuario_id)
```

Límites: máx. 4 parámetros por función (frontend); complejidad ciclomática de plantilla ≤ 7 y condicionales ≤ 3; Python `C90` activo.

### 3. Manejo de Errores

```python
# ✅ CORRECTO (backend): invariantes en __post_init__ lanzan DomainError con `codigo`;
# la capa shared.errors las convierte en {"detail", "code"}
if self.cupo_total <= 0:
    raise TarjetaInvalidaError("El cupo total debe ser mayor a cero")
```

```typescript
// ✅ CORRECTO (frontend): los errores HTTP se tratan en erroresHttpInterceptor (core) y se
// re-lanzan con throwError; los componentes no capturan códigos HTTP sueltos
catchError((error: HttpErrorResponse): Observable<never> => {
  /* ... */
  return throwError((): HttpErrorResponse => error);
})

// ❌ INCORRECTO: console.log (no-console solo permite warn/error), `any`, `!` (no-non-null-assertion)
```

- Backend: no se enumeran usuarios (mismo error para correo inexistente y clave incorrecta); los errores de negocio no filtran detalles internos.
- Frontend: `no-alert` activo; no usar `alert/confirm/prompt`.

### 4. Restricciones Arquitectónicas de Codificación

#### Respeto de Capas y Responsabilidades

```typescript
// ✅ CORRECTO — frontend: feature → shared/core/env (validado por eslint-plugin-boundaries)
import { BarraProgresoComponent } from '@shared/components/barra-progreso/barra-progreso.component';

// ❌ INCORRECTO — un feature importando otro feature (boundaries/element-types = error)
import { X } from '@feature/autenticacion/shared/service/error-autenticacion'; // desde dashboard
```

```python
# ✅ CORRECTO — backend: presentation → application → domain; infrastructure → domain
# application/listar_tarjetas.py importa solo domain (TarjetaRepositorio, entidades)

# ❌ INCORRECTO — domain/ o application/ importando FastAPI o SQLAlchemy (sin ejemplo real disponible)
from sqlalchemy.orm import Session   # dentro de app/modules/*/domain o application
```

Reglas adicionales:

- **Frontend**: `core` no depende de otras capas; `shared` sin lógica de negocio; `layout` solo estructura; features lazy-loaded vía `*.routes.ts`; componentes standalone con `OnPush` y signals; plantillas con `@if`/`@for` (`prefer-control-flow`); llamadas HTTP solo a través de `HttpService` + `environment.endpoint`.
- **Backend**: cada módulo se cablea en su `presentation/dependencies.py`; la raíz de composición es `app/main.py`. Dependencias entre módulos permitidas hoy: `dashboard → creditos/tarjetas/movimientos`, `analitica → movimientos`, `notificaciones → creditos`, y `presentation → identidad`; no crear dependencias nuevas sin revisión arquitectónica.
- **Seguridad (anti-BOLA)**: toda consulta se acota al `usuario_id` del token; ningún endpoint recibe IDs de usuario en la ruta o el cuerpo.
- **Contrato**: el JSON de la API es camelCase y debe coincidir con `feature/dashboard/shared/interfaces/*.ts`; todo cambio de esquema Pydantic requiere actualizar la interfaz TypeScript.
- **Dinero**: pesos COP como enteros en backend; formato `es-CO` con `CurrencyPipe` en frontend.

### 5. UI / Design System

N/A — el proyecto no tiene insumos de diseño (Tokens.json/Hoja_Variantes.md) generados todavía

### 6. Pruebas Unitarias

#### Convención de Testing: Karma/Jasmine + fixtures (frontend) y pytest con helpers `_fabrica` (backend). No hay Test Data Builder formal; se usa Arrange/Act/Assert de forma implícita.

```typescript
// ✅ CORRECTO — frontend: TestBed + doble tipado + fixture compartida; ComponentObject (*.co.ts) para interacción
describe('DashboardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    servicio = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpMock.verify());

  it('debe consultar el dashboard en el API', () => { /* flush(DASHBOARD_FIXTURE) + expect */ });
});

// ❌ INCORRECTO: datos inline repetidos en cada test, peticiones HTTP reales, sin httpMock.verify()
```

```python
# ✅ CORRECTO — backend: función fábrica con overrides, nombre del test = comportamiento, parametrize para invariantes
def _cuenta(**cambios: object) -> CuentaAhorro:
    datos: dict[str, object] = {"id": "c1", "usuario_id": 1, "saldo_total": 1_000, ...}
    return CuentaAhorro(**{**datos, **cambios})

def test_la_cuenta_calcula_su_numero_enmascarado_y_el_saldo_retenido() -> None: ...

@pytest.mark.parametrize("cambios", [{"saldo_total": -1}, {"saldo_disponible": 2_000}])
def test_la_cuenta_rechaza_estados_invalidos(cambios: dict[str, object]) -> None: ...
```

- Frontend: tests `it('debe …')` en español; un `*.spec.ts` junto a cada servicio/componente; fixtures en `feature/*/shared/testing/`. Cobertura con `npm run test:ci`.
- Backend: pruebas unitarias de dominio en `tests/unit`, de API en `tests/integration` con `TestClient` y BD SQLite temporal (`conftest.py`); cobertura mínima **80 %** (`fail_under`).

### 7. Patrones Anteriores — No Replicar

| Patrón anterior | Dónde sigue existiendo | Patrón vigente |
| --------------- | ---------------------- | -------------- |
| `feature/producto` y `feature/inicio` (plantilla, sin ruta) | `frontend/src/app/feature/` | Features de `dashboard` y `autenticacion` |
| `apiKeyInterceptor` con `x-api-key: reqres-free-v1` | `core/interceptors/api-key/` | Solo `Authorization: Bearer` vía `autenticacionInterceptor` |
| Tests Cypress de plantilla | `frontend/cypress/` | Karma/Jasmine + ComponentObject |

> Detección sin historial git (el repositorio no está versionado): estas filas provienen de la documentación del proyecto, no de fechas de creación.

---

## Convenciones Recomendadas

### 1. Organización de Archivos

```
frontend/src/app/
  core/{constants,guards,interceptors,interfaces,services}
  shared/{components,directives,constants,utils}
  layout/{header,main-layout,navbar}
  feature/<dominio>/{components,shared/{constants,interfaces,service,testing}, <dominio>.routes.ts}
backend/app/
  main.py · seed.py · shared/
  modules/<dominio>/{domain,application,infrastructure,presentation}
backend/tests/{unit,integration,conftest.py}
```

### 2. Patrones de Código

```typescript
// Estado derivado con computed y entradas con input.required (patrón dominante en componentes)
public readonly tarjeta: InputSignal<TarjetaCredito> = input.required<TarjetaCredito>();
public readonly cupoDisponible: Signal<number> = computed<number>(
  () => this.tarjeta().cupoTotal - this.tarjeta().cupoUtilizado
);
// Constructor solo para efectos de vida (afterNextRender, suscripciones a router); DI con inject()
```

```python
# Entidades de dominio inmutables con invariantes en __post_init__
@dataclass(frozen=True, slots=True)
class TarjetaCredito: ...
```

### 3. Convenciones Complementarias para Tests

```typescript
// Naming: 'debe <comportamiento>' · dobles con jasmine.createSpy y useValue en providers
buscar = jasmine.createSpy('buscarMovimientos').and.returnValue(of(DASHBOARD_FIXTURE.movimientos));
providers: [{ provide: ReportesService, useValue: { buscarMovimientos: buscar } }]
```

---

## Configuración de Herramientas

### Linter

```javascript
// frontend/eslint.config.js (extracto — ESLint 9 flat config)
extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic,
          ...angular.configs.tsRecommended, prettierRules, boundaries.configs.strict],
rules: {
  '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
  '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'explicit', overrides: { constructors: 'no-public' } }],
  '@typescript-eslint/explicit-function-return-type': 'error',
  '@typescript-eslint/typedef': ['error', { variableDeclaration: true, memberVariableDeclaration: true, parameter: true, propertyDeclaration: true }],
  '@typescript-eslint/no-magic-numbers': 'error',
  '@typescript-eslint/no-non-null-assertion': 'error',
  '@typescript-eslint/prefer-readonly': 'error',
  'boundaries/element-types': ['error', { default: 'disallow', rules: [
    { from: 'core', allow: ['core', 'env'] },
    { from: 'shared', allow: ['shared', 'core', 'env'] },
    { from: 'feature', allow: ['shared', 'core', 'env'] },
    { from: 'layout', allow: ['shared', 'core', 'env'] },
    { from: 'feature-routes', allow: ['shared', 'core', 'env', 'feature-routes', 'feature'] },
    { from: 'app', allow: ['env', 'app', 'core', 'shared', 'layout', 'feature-routes'] } ] }],
  'import/order': ['error', { 'newlines-between': 'never', alphabetize: { order: 'asc', caseInsensitive: true } }],
  eqeqeq: 'error', quotes: ['error', 'single'], 'no-console': ['warn', { allow: ['warn', 'error'] }],
}
// Plantillas HTML: prefer-control-flow, cyclomatic-complexity ≤ 7, conditional-complexity ≤ 3,
// no-any, button-has-type, no-inline-styles + reglas de accesibilidad
// tsconfig: strict, noImplicitOverride, noImplicitReturns, noPropertyAccessFromIndexSignature, strictTemplates
```

```toml
# backend/pyproject.toml
[tool.ruff]
line-length = 100
target-version = "py312"
[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "SIM", "S", "C90"]
ignore = ["S101"]
[tool.mypy]
strict = true
plugins = ["pydantic.mypy"]
files = ["app"]
[tool.coverage.report]
fail_under = 80
```

### Formatter

```json
// frontend/.prettierrc.json
{ "semi": true, "trailingComma": "es5", "singleQuote": true, "printWidth": 100,
  "tabWidth": 2, "useTabs": false, "arrowParens": "avoid", "endOfLine": "lf" }
```

Backend: sin formateador dedicado configurado; se usa `ruff` (línea de 100) como referencia de estilo. `.editorconfig` (frontend): UTF-8, 2 espacios, LF final.

### Comandos

| Acción | Comando |
| ------ | ------- |
| Lint | Frontend: `npm run lint` · Backend: `.venv\Scripts\python -m ruff check app tests` y `.venv\Scripts\python -m mypy` |
| Lint con corrección | Frontend: `npm run lint:fix` · Backend: N/A |
| Formato | Frontend: `npm run format:write` (verificar: `npm run format:test`) · Backend: N/A |
| Tests unitarios | Frontend: `npm run test:ci` · Backend: `.venv\Scripts\python -m pytest` |
| Build | Frontend: `npm run build` · Backend: N/A |

---

## Recomendaciones de Evolución

> Prácticas **no observadas hoy** en el código; son propuestas, no estándares vigentes.

- **Test Data Builder + patrón 3A explícito** (comentarios Arrange/Act/Assert) para reemplazar las fábricas con `**cambios`.
- **Formateador en backend**: añadir `ruff format` y script de verificación en CI.
- **Pipeline del backend** (lint, mypy, pytest con cobertura, SonarQube) equivalente al `Jenkinsfile` del frontend.
- **Eliminar `apiKeyInterceptor`** y los restos de plantilla (`feature/producto`, `feature/inicio`, Cypress sin mantener).
- **Contrato API generado** (OpenAPI → tipos TypeScript) para evitar desincronización manual del JSON camelCase.
- **Mensajes de error al usuario** en `erroresHttpInterceptor` (hoy solo `console.error` con un TODO).
- **Migraciones Alembic** si el esquema deja de ser demo; **actualizar `backend/README.md`** (el login ya incluye desafío de segundo factor).

---

## Referencias y Recursos

- `frontend/guidelines/` (ARQUITECTURA, BOUNDARIES, ESLINT-RULES, IMPORT-ORDER, PRETTIER, DEPENDENCIAS)
- `frontend/readme.md`, `backend/README.md` y GPS arquitectónico `docs/architecture/index.md`

---

> **Método Ceiba generar-estandares-codigo** v6.1.97 | Usuario: Wilmer Giovanny Torres Achury | Fecha: 2026-10-12
