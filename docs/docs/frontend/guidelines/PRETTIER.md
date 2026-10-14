# Prettier en el Proyecto

Este documento explica el uso de Prettier en este proyecto Angular, cómo está configurado, qué reglas aplica y cómo puedes utilizarlo para mantener un código limpio y consistente.

---

## ¿Qué es Prettier?

Prettier es un formateador de código automático que aplica reglas de estilo consistentes a archivos de código fuente. Ayuda a evitar discusiones sobre el estilo y asegura que todo el equipo siga el mismo formato.

---

## ¿Cómo funciona en este proyecto?

- Prettier está integrado a través de los plugins `prettier` y `eslint-plugin-prettier`.
- Se ejecuta automáticamente al correr los scripts de lint y formateo.
- El archivo de configuración principal es `.prettierrc` (si existe) o las reglas por defecto.
- Se aplica a archivos `.ts`, `.js`, `.html`, `.scss`, `.json` dentro de `src/`.

---

## Scripts disponibles
- `npm run format:test` — Verifica si el código cumple con el formato Prettier.
- `npm run format:write` — Aplica el formato Prettier a todos los archivos relevantes.

---

## Ejemplo de uso

Antes de formatear:
```ts
function foo( ) {console.log('bar');}
```

Después de formatear con Prettier:
```ts
function foo() {
  console.log('bar');
}
```

---

## Personalización
Puedes personalizar las reglas de Prettier creando un archivo `.prettierrc` en la raíz del proyecto. Ejemplo:
```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

---

## Integración con ESLint
- El plugin `eslint-plugin-prettier` permite que los errores de formato sean reportados como errores de ESLint.
- El paquete `eslint-config-prettier` desactiva reglas de ESLint que puedan entrar en conflicto con Prettier.

---

## Recursos
- [Prettier (sitio oficial)](https://prettier.io/)
- [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier)
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)

Para dudas o personalizaciones avanzadas, consulta la documentación oficial o contacta al equipo de desarrollo.
