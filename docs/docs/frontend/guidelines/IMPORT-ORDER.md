# eslint-plugin-import: Orden de Imports en el Proyecto

Este documento explica el uso y configuración del plugin `eslint-plugin-import` en este proyecto Angular, cómo funciona la regla de orden de imports, cómo está configurada actualmente y cómo puedes personalizarla.

---

## ¿Qué es eslint-plugin-import?

`eslint-plugin-import` es un plugin de ESLint que ayuda a gestionar y validar las declaraciones de importación en archivos JavaScript y TypeScript. Permite:
- Detectar imports duplicados o no utilizados.
- Validar la existencia y resolución de módulos importados.
- En este proyecto, se utiliza principalmente para **enforzar un orden consistente de los imports**.

---

## ¿Cómo funciona la regla de orden de imports?

La regla `import/order` permite definir cómo deben agruparse y ordenarse los imports en cada archivo. Esto mejora la legibilidad, facilita el mantenimiento y reduce conflictos en el control de versiones.

### Grupos de imports configurados
Actualmente, la regla está configurada para ordenar los imports en los siguientes grupos (de arriba hacia abajo):
- **builtin**: Módulos nativos de Node.js (ej: `fs`, `path`).
- **external**: Paquetes de terceros (ej: `@angular/core`, `rxjs`).
- **internal**: Imports internos del proyecto (ej: rutas absolutas o alias).
- **parent**: Imports relativos a carpetas superiores (`../`).
- **sibling**: Imports relativos a archivos hermanos (`./`).
- **index**: Imports del archivo `index` en la carpeta actual.
- **object**: Imports de objetos (poco común).
- **type**: Imports solo de tipos TypeScript.

### Agrupación personalizada
Se han definido agrupaciones personalizadas para priorizar imports de ciertas carpetas:
```js
pathGroups: [
  { pattern: 'src/app/core/**', group: 'internal', position: 'before' },
  { pattern: 'src/app/shared/**', group: 'internal', position: 'before' },
  { pattern: 'src/app/feature/**', group: 'internal', position: 'before' },
]
```
Esto asegura que los imports de `core`, `shared` y `feature` aparezcan antes que otros imports internos.

---

## Ejemplo de orden correcto
```ts
import { NgModule } from '@angular/core'; // external
import { Observable } from 'rxjs';         // external
import { environment } from 'src/environments/environment'; // internal
import { AuthService } from 'src/app/core/auth.service';    // internal (core)
import { SharedModule } from 'src/app/shared/shared.module';// internal (shared)
import { ClienteService } from 'src/app/feature/cliente/cliente.service'; // internal (feature)
import { MyComponent } from '../my-component'; // parent
import { helper } from './helper';             // sibling
```

---

## Personalización de la regla
Puedes modificar el orden de los grupos o agregar nuevos patrones en la sección `import/order` de `eslint.config.js`:
```js
'import/order': [
  'error',
  {
    groups: [ ... ],
    pathGroups: [ ... ],
    ...
  },
],
```
- Cambia el orden de los grupos en el array `groups`.
- Agrega o ajusta patrones en `pathGroups` para priorizar otras carpetas.

---

## Recursos
- [eslint-plugin-import (GitHub)](https://github.com/import-js/eslint-plugin-import)
- [Regla import/order (documentación)](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md)

Para cambios avanzados, consulta la documentación oficial y ajusta la configuración según las necesidades de tu equipo o arquitectura.
