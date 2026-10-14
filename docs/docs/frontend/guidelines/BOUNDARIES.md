# eslint-plugin-boundaries en el Proyecto

Este documento explica el uso de `eslint-plugin-boundaries` en este proyecto Angular, cómo funciona, las reglas actuales, cómo personalizarlas y qué otros plugins son necesarios para su funcionamiento.

---

## ¿Qué es eslint-plugin-boundaries?

`eslint-plugin-boundaries` es un plugin de ESLint que permite definir y hacer cumplir reglas de arquitectura y dependencias entre carpetas, módulos o capas dentro de un proyecto. Es especialmente útil para mantener la separación de responsabilidades y evitar dependencias no deseadas entre capas (por ejemplo, que un feature importe directamente de otro feature).

---

## ¿Cómo funciona?

- Define "elementos" (elements) que representan capas o dominios (por ejemplo: core, shared, feature, layout, env, main, app).
- Cada elemento se identifica por un patrón de ruta.
- Se configuran reglas que determinan qué elementos pueden importar de cuáles.
- Si se viola una regla, ESLint reporta un error.

---

## Alias de rutas y su importancia

Es fundamental que los alias de rutas definidos en el `tsconfig.json` (por ejemplo, `@core/*`, `@shared/*`, etc.) estén alineados con los patrones de los elementos en la configuración de boundaries. Esto asegura que las reglas de arquitectura se apliquen correctamente, incluso cuando se usan imports con alias en lugar de rutas relativas. Si agregas o cambias un alias, actualiza también los patrones en `boundaries/elements` para mantener la consistencia y la protección arquitectónica.

---

## Configuración actual en este proyecto

### Plugins necesarios
- `eslint-plugin-boundaries` (core del sistema)
- `@typescript-eslint` (para TypeScript)
- `eslint` (base)
- `eslint-plugin-import` (para resolución de imports)
- `eslint-plugin-unused-imports` (limpieza de imports)

### Extensión y uso
- El plugin está registrado en la sección `plugins` y extendido con `boundaries.configs.strict`.
- Los elementos y reglas están definidos en la sección `settings` y `rules` del archivo `eslint.config.js`.

### Elementos configurados
```js
'boundaries/elements': [
  { type: 'core', pattern: 'src/app/core' },
  { type: 'shared', pattern: 'src/app/shared' },
  { type: 'feature', pattern: 'src/app/feature/([^/]+)', capture: ['feature'] },
  { type: 'layout', pattern: 'src/app/layout' },
  { type: 'env', pattern: 'environments', mode: 'folder', basePattern: 'src' },
  { type: 'main', mode: 'file', pattern: 'main.ts', basePattern: 'src' },
  { type: 'feature-routes', mode: 'file', pattern: 'feature/*/*.routes.ts', capture: ['feature'], basePattern: 'src/app' },
  { type: 'app', mode: 'file', pattern: 'app(-|.)*.ts', basePattern: 'src/app' },
]
```

### Reglas actuales
```js
'boundaries/element-types': [
  'error',
  {
    default: 'disallow',
    rules: [
      { from: 'core', allow: ['core', 'env'] },
      { from: 'shared', allow: ['shared', 'core', 'env'] },
      { from: 'feature', allow: ['shared', 'core', 'env'] },
      { from: 'feature-routes', allow: ['shared', 'core', 'env', 'feature-routes', 'feature'] },
      { from: 'layout', allow: ['shared', 'core', 'env'] },
      { from: 'main', allow: ['app'] },
      { from: 'app', allow: ['env', 'app', 'core', 'shared', 'layout', 'feature-routes'] },
    ],
  },
],
```
- Por ejemplo, un módulo en `feature` solo puede importar de `shared`, `core` o `env`, pero nunca de otro `feature`.

### Ignorados
- `'boundaries/ignore': ['node_modules/**', 'karma.conf.js', 'cypress.config.ts']`

---

## Cómo agregar, quitar o modificar reglas

### Agregar un nuevo tipo de elemento
1. Añade un objeto a la lista de `boundaries/elements` en `eslint.config.js`.
   ```js
   { type: 'utils', pattern: 'src/app/utils' },
   ```
2. Agrega una regla en `boundaries/element-types` para definir quién puede importar de `utils`.
   ```js
   { from: 'utils', allow: ['core', 'shared', 'feature'] },
   ```

### Modificar reglas existentes
- Cambia el array `allow` para permitir o restringir dependencias.
  ```js
  { from: 'feature', allow: ['shared', 'core', 'env', 'utils'] },
  ```

### Quitar una regla
- Elimina el objeto correspondiente de la lista de reglas en `boundaries/element-types`.

### Hacer una excepción puntual
- Usa comentarios de ESLint en el archivo donde necesitas la excepción:
  ```js
  // eslint-disable-next-line boundaries/element-types
  import { algo } from '../otro-feature';
  ```

---

## Ejemplo práctico: agregar una nueva capa
Supón que agregas una carpeta `src/app/utils`:
1. En `boundaries/elements`:
   ```js
   { type: 'utils', pattern: 'src/app/utils' },
   ```
2. En `boundaries/element-types`:
   ```js
   { from: 'utils', allow: ['core', 'shared', 'feature'] },
   ```

---

## Recursos
- [eslint-plugin-boundaries (GitHub)](https://github.com/SonarSource/eslint-plugin-boundaries)
- [Documentación oficial](https://github.com/SonarSource/eslint-plugin-boundaries#readme)

Para cambios avanzados, consulta la documentación oficial y revisa los patrones de importación y las necesidades de tu arquitectura.
