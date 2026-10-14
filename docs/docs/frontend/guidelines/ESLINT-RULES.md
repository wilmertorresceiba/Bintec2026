# Reglas de ESLint en el Proyecto

Este documento describe todas las reglas de ESLint personalizadas y relevantes configuradas en este proyecto Angular. Incluye ejemplos prácticos, explicación de su propósito y cómo ayudan a mantener la calidad y consistencia del código.

---

## ¿Qué es ESLint?

ESLint es una herramienta de análisis estático para identificar problemas en el código JavaScript/TypeScript, aplicar reglas de estilo y reforzar buenas prácticas.

---

## Reglas configuradas y ejemplos

### Angular ESLint
- **@angular-eslint/directive-selector**: Obliga a que los selectores de directivas usen el prefijo `app` y estilo camelCase.
- **@angular-eslint/component-selector**: Obliga a que los selectores de componentes usen el prefijo `app` y estilo kebab-case.
- **@angular-eslint/no-conflicting-lifecycle**: Prohíbe implementar métodos de ciclo de vida en conflicto.
- **@angular-eslint/no-input-rename**: Prohíbe renombrar inputs vía decorador.
- **@angular-eslint/no-inputs-metadata-property**: Prohíbe el uso de la propiedad `inputs` en metadatos.
- **@angular-eslint/no-output-native**: Prohíbe outputs con nombres nativos del DOM.
- **@angular-eslint/no-output-on-prefix**: Prohíbe outputs que comiencen con `on`.
- **@angular-eslint/no-output-rename**: Prohíbe renombrar outputs vía decorador.
- **@angular-eslint/no-outputs-metadata-property**: Prohíbe el uso de la propiedad `outputs` en metadatos.
- **@angular-eslint/use-lifecycle-interface**: Obliga a implementar interfaces de ciclo de vida si se usan sus métodos.
- **@angular-eslint/use-pipe-transform-interface**: Obliga a implementar la interfaz `PipeTransform` en pipes.

### TypeScript ESLint
- **@typescript-eslint/explicit-member-accessibility**: Exige declarar la visibilidad de los miembros de clase.
- **@typescript-eslint/explicit-module-boundary-types**: Obliga a tipar explícitamente los retornos de funciones públicas.
- **@typescript-eslint/max-params**: Limita la cantidad de parámetros en funciones.
- **@typescript-eslint/no-magic-numbers**: Prohíbe números "mágicos" sin contexto.
- **@typescript-eslint/consistent-generic-constructors**: Fuerza el uso consistente de constructores genéricos.
- **@typescript-eslint/member-ordering**: Obliga a un orden específico de miembros en clases.
- **@typescript-eslint/naming-convention**: Fuerza convenciones de nombres para variables, tipos y propiedades.
- **@typescript-eslint/no-empty-function**: Prohíbe funciones vacías.
- **@typescript-eslint/no-misused-new**: Prohíbe el uso incorrecto de constructores.
- **@typescript-eslint/no-namespace**: Prohíbe el uso de namespaces.
- **@typescript-eslint/no-non-null-assertion**: Prohíbe el uso de `!` para afirmar no nulo.
- **@typescript-eslint/no-shadow**: Prohíbe variables que oculten otras del mismo nombre.
- **@typescript-eslint/no-empty-interface**: Prohíbe interfaces vacías.
- **@typescript-eslint/no-unused-expressions**: Prohíbe expresiones no usadas.
- **@typescript-eslint/no-use-before-define**: Prohíbe el uso de variables antes de su declaración.
- **@typescript-eslint/no-var-requires**: Prohíbe el uso de `require` en TypeScript.
- **@typescript-eslint/prefer-for-of**: Prefiere el uso de `for-of` sobre otros bucles.
- **@typescript-eslint/prefer-function-type**: Prefiere tipos de función sobre interfaces para funciones.
- **@typescript-eslint/prefer-namespace-keyword**: Prefiere `namespace` sobre `module`.
- **@typescript-eslint/triple-slash-reference**: Controla el uso de referencias triple slash.
- **@typescript-eslint/unified-signatures**: Obliga a unificar firmas de métodos similares.
- **@typescript-eslint/no-duplicate-enum-values**: Prohíbe valores duplicados en enums.
- **@typescript-eslint/no-for-in-array**: Prohíbe el uso de `for-in` en arrays.
- **@typescript-eslint/no-non-null-asserted-optional-chain**: Prohíbe el uso de `!` en cadenas opcionales.
- **@typescript-eslint/prefer-readonly**: Prefiere propiedades readonly cuando es posible.
- **@typescript-eslint/explicit-function-return-type**: Obliga a tipar explícitamente los retornos de funciones.
- **@typescript-eslint/typedef**: Obliga a tipar explícitamente variables, parámetros y propiedades.
- **@typescript-eslint/array-type**: Prefiere el uso de `T[]` sobre `Array<T>`.
- **@typescript-eslint/no-inferrable-types**: Permite tipos inferibles (desactivada).
- **@typescript-eslint/no-explicit-any**: Advierte sobre el uso de `any`.
- **max-params**: Advierte si una función tiene más de 4 parámetros.

### JavaScript/ESLint base
- **eqeqeq**: Obliga el uso de `===` y `!==` en vez de `==` y `!=`.
- **no-console**: Advierte sobre el uso de `console.log` (permite `warn` y `error`).
- **quotes**: Obliga el uso de comillas simples.
- **no-extra-boolean-cast**: Desactivada (se usa la de TypeScript).
- **no-duplicate-case**: Prohíbe casos duplicados en switch.
- **no-dupe-keys**: Prohíbe claves duplicadas en objetos.
- **no-unreachable**: Prohíbe código inalcanzable.
- **no-use-before-define**: Prohíbe el uso de variables antes de su declaración.
- **no-empty**: Advierte sobre bloques vacíos.

### Boundaries
- **boundaries/element-types**: Controla las dependencias entre capas (core, shared, feature, etc.).

### Import Management
- **@typescript-eslint/no-unused-vars**: Desactivada (se usa la de unused-imports).
- **unused-imports/no-unused-imports**: Elimina imports no utilizados automáticamente.
- **unused-imports/no-unused-vars**: Advierte sobre variables no usadas, ignora las que empiezan con `_`.
- **import/order**: Enforza el orden y agrupación de imports, priorizando core, shared, feature y layout.

### HTML/Angular Template
- **@angular-eslint/template/prefer-self-closing-tags**: Prefiere el uso de etiquetas autocontenidas.
- **@angular-eslint/template/prefer-control-flow**: Prefiere el uso de directivas de control de flujo modernas.

---

## Ejemplos prácticos

### @typescript-eslint/explicit-member-accessibility
```ts
// Incorrecto
class Foo { bar: string; }
// Correcto
class Foo { public bar: string; }
```

### @typescript-eslint/no-magic-numbers
```ts
// Incorrecto
if (x > 42) { ... }
// Correcto
const MAX_VALUE = 42;
if (x > MAX_VALUE) { ... }
```

### boundaries/element-types
```ts
// Incorrecto: importar de otro feature
import { X } from 'src/app/feature/otro-feature';
// Correcto: importar solo de shared/core/env
import { Y } from 'src/app/shared/alguna-utilidad';
```

### import/order
```ts
// Incorrecto
import { B } from './b';
import { A } from 'rxjs';
// Correcto
import { A } from 'rxjs';
import { B } from './b';
```

### unused-imports/no-unused-imports
```ts
// Incorrecto
import { X } from './x'; // X no se usa
// Correcto
// (Import eliminado si no se usa)
```

### @typescript-eslint/no-extra-boolean-cast
```ts
// Incorrecto
const isValid = !!valor;
// Correcto
const isValid = Boolean(valor);
```

---

## ¿Cómo funcionan estas reglas?
- Se aplican automáticamente al guardar o al ejecutar `npm run lint`.
- Los errores y advertencias se muestran en la terminal o en el IDE.
- Puedes personalizar o desactivar reglas en el archivo `eslint.config.js`.

---

## Recursos
- [ESLint (sitio oficial)](https://eslint.org/)
- [Reglas de Angular ESLint](https://github.com/angular-eslint/angular-eslint)
- [Reglas de TypeScript ESLint](https://typescript-eslint.io/rules/)
- [Reglas de boundaries](https://github.com/SonarSource/eslint-plugin-boundaries)
- [Reglas de import](https://github.com/import-js/eslint-plugin-import)

Para dudas o personalizaciones avanzadas, consulta la documentación oficial o contacta al equipo de desarrollo.
