// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettierRules = require('eslint-plugin-prettier/recommended');
const boundaries = require('eslint-plugin-boundaries');
const importPlugin = require('eslint-plugin-import');
const unusedImports = require('eslint-plugin-unused-imports');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './cypress/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      // @ts-ignore
      boundaries,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      prettierRules,
      // @ts-ignore
      boundaries.configs.strict,
    ],
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      'boundaries/ignore': [
        'node_modules/**',
        'karma.conf.js',
        'cypress.config.ts',
        'cypress/**',
      ],
      'boundaries/dependency-nodes': ['import', 'dynamic-import'],
      'boundaries/elements': [
        {
          type: 'core',
          pattern: 'src/app/core',
        },
        {
          type: 'shared',
          pattern: 'src/app/shared',
        },
        {
          type: 'feature',
          pattern: 'src/app/feature/([^/]+)',
          capture: ['feature'],
        },
        {
          type: 'layout',
          pattern: 'src/app/layout',
        },
        {
          type: 'env',
          pattern: 'environments',
          mode: 'folder',
          basePattern: 'src',
        },
        {
          type: 'main',
          mode: 'file',
          pattern: 'main.ts',
          basePattern: 'src',
        },
        {
          type: 'feature-routes',
          mode: 'file',
          pattern: 'feature/*/*.routes.ts',
          capture: ['feature'],
          basePattern: 'src/app',
        },
        {
          type: 'app',
          mode: 'file',
          pattern: 'app(-|.)*.ts',
          basePattern: 'src/app',
        },
      ],
    },
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/no-conflicting-lifecycle': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-inputs-metadata-property': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-output-on-prefix': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/no-outputs-metadata-property': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/use-pipe-transform-interface': 'error',
      
      // TypeScript Rules
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'explicit', overrides: { constructors: 'no-public' } },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/max-params': 'error',
      '@typescript-eslint/no-magic-numbers': 'error',
      '@typescript-eslint/consistent-generic-constructors': 'error',
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'property', format: null },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        { selector: 'typeLike', format: ['PascalCase'] },
      ],
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-shadow': ['error', { hoist: 'all' }],
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',
      '@typescript-eslint/triple-slash-reference': [
        'error',
        { path: 'always', types: 'prefer-import', lib: 'always' },
      ],
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
      '@typescript-eslint/typedef': [
        'error',
        {
          arrowParameter: false,
          variableDeclaration: true,
          memberVariableDeclaration: true,
          objectDestructuring: false,
          arrayDestructuring: false,
          parameter: true,
          propertyDeclaration: true,
        },
      ],
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array',
        },
      ],
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'max-params': ['warn', 4],
      eqeqeq: 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      'no-implicit-coercion': ['error',{boolean:true}],

      // ─── SonarQube rules — via @typescript-eslint (requieren parserOptions.project) ────────────
      // S6582 — Prefer `x?.y` over `x && x.y`
      '@typescript-eslint/prefer-optional-chain': 'error',
      // S6606 — Prefer `x ?? y` over `x || y` when x could be null/undefined
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      // S6544 — Promises must be handled; checksVoidReturn:false evita conflicto con event handlers Angular
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      // S4123 — await solo sobre Thenables
      '@typescript-eslint/await-thenable': 'error',
      // S4325 — Eliminar type assertions innecesarios: `value as string` cuando ya es string
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      // S6557 — Prefer .startsWith()/.endsWith() sobre .indexOf()/.slice()
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',

      // ─── SonarQube rules — via eslint core ───────────────────────────────────────────────────
      // S1442 — No alert/confirm/prompt en producción
      'no-alert': 'error',
      // S6660 — No `if` solitario dentro de un `else` (=> else if)
      'no-lonely-if': 'error',
      // S6635 — Los constructores no deben retornar valores
      'no-constructor-return': 'error',
      // S1656 — No auto-asignaciones (a = a)
      'no-self-assign': ['error', { props: true }],
      // S6644 — No ternarios innecesarios: `a ? true : false` => `a`
      'no-unneeded-ternary': 'error',

      

      // Boundaries Rules
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'core',
              allow: ['core', 'env'],
            },
            {
              from: 'shared',
              allow: ['shared', 'core', 'env'],
            },
            {
              from: 'feature',
              allow: ['shared', 'core', 'env'],
            },
            {
              from: 'feature-routes',
              allow: ['shared', 'core', 'env', 'feature-routes', 'feature'],
            },
            {
              from: 'layout',
              allow: ['shared', 'core', 'env'],
            },
            {
              from: 'main',
              allow: ['app'],
            },
            {
              from: 'app',
              allow: ['env', 'app', 'core', 'shared', 'layout', 'feature-routes'],
            },
          ],
        },
      ],

      // Import Management
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: 'src/app/core/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: 'src/app/shared/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: 'src/app/feature/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: 'src/app/layout/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
      prettierRules,
    ],
    rules: {
      // Control flow moderno (Angular 17+)
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/prefer-control-flow': 'error',

      // Complejidad — equivalente a SonarQube S3776 / S1541
      '@angular-eslint/template/cyclomatic-complexity': ['error', { maxComplexity: 7 }],
      '@angular-eslint/template/conditional-complexity': ['error', { maxComplexity: 3 }],

      // Seguridad y tipo — equivalente a SonarQube S4204 / S2966
      '@angular-eslint/template/no-any': 'error',

      // Calidad HTML — equivalente a SonarQube HTML rules
      '@angular-eslint/template/button-has-type': 'error',
      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/no-inline-styles': 'error',
      '@angular-eslint/template/no-interpolation-in-attributes': 'error',
      '@angular-eslint/template/no-nested-tags': 'error',

      // Modernización — patrones Angular 17+ / @for contextual vars
      '@angular-eslint/template/prefer-template-literal': 'error',
      '@angular-eslint/template/prefer-contextual-for-variables': 'warn',
    },
  }
);
