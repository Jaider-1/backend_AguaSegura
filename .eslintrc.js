export default {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: new URL('.', import.meta.url).pathname,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin', 
    'import',
    'unused-imports'  // Para detectar imports no usados
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'airbnb-typescript/base',
    '@nestjs/eslint-config',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [
    '.eslintrc.cjs', 
    'dist/**', 
    'node_modules/**',
    'coverage/**',
    '*.config.js'
  ],
  rules: {
    // Reglas específicas para NestJS
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // Reglas de estilo y mejores prácticas
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-await-in-loop': 'error',
    'no-return-await': 'error',
    'require-await': 'error',
    
    // Mejores prácticas TypeScript
    '@typescript-eslint/no-unused-vars': ['error', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'caughtErrorsIgnorePattern': '^_'
    }],
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/consistent-type-imports': [
      'error', 
      { prefer: 'type-imports' }
    ],
    
    // Reglas de importación
    'import/order': [
      'error',
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always',
        'alphabetize': { 
          'order': 'asc', 
          'caseInsensitive': true 
        }
      }
    ],
    
    // Detectar imports no usados
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      { 
        'vars': 'all', 
        'varsIgnorePattern': '^_', 
        'args': 'after-used', 
        'argsIgnorePattern': '^_' 
      }
    ],
  },
  overrides: [
    {
      files: ['*.spec.ts', '*.test.ts'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off'
      }
    },
    {
      files: ['database/migrations/*.ts', 'database/seeds/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ]
};