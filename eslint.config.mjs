/* eslint-disable import-x/no-extraneous-dependencies */
import eslint from '@eslint/js';
import { configs, config } from 'typescript-eslint';
import eslintPluginImportX from 'eslint-plugin-import-x';
import jest from 'eslint-plugin-jest';

/* eslint-disable @typescript-eslint/naming-convention */

export default config(
  eslint.configs.recommended,
  ...configs.strict,
  eslintPluginImportX.flatConfigs.recommended,
  eslintPluginImportX.flatConfigs.typescript,
  {
    ignores: ['**/dist', '**/tmp', '**/coverage']
  },
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    rules: {
      '@typescript-eslint/no-extraneous-class': [
        'error',
        {
          allowWithDecorator: true
        }
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            accessors: 'no-public',
            constructors: 'no-public'
          }
        }
      ],
      '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: [
            'public-static-field',
            'protected-static-field',
            'private-static-field',
            'public-instance-field',
            'protected-instance-field',
            'private-instance-field',
            'constructor',
            'public-static-method',
            'protected-static-method',
            'private-static-method',
            'public-abstract-method',
            'protected-abstract-method',
            'public-instance-method',
            'protected-instance-method',
            'private-instance-method'
          ]
        }
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid'
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE']
        },
        {
          selector: 'typeLike',
          format: ['PascalCase']
        },
        {
          selector: 'function',
          format: ['PascalCase', 'camelCase']
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase', 'snake_case']
        },
        {
          selector: 'method',
          format: ['camelCase', 'PascalCase'],
          modifiers: ['static']
        },
        {
          selector: 'property',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase', 'snake_case'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow'
        }
      ],
      '@typescript-eslint/no-inferrable-types': [
        'error',
        {
          ignoreParameters: true,
          ignoreProperties: true
        }
      ],
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-parameter-properties': 'off',
      '@typescript-eslint/typedef': [
        'error',
        {
          arrayDestructuring: true,
          arrowParameter: false,
          memberVariableDeclaration: false,
          variableDeclarationIgnoreFunction: true
        }
      ],
      '@typescript-eslint/no-shadow': [
        'error',
        {
          hoist: 'all'
        }
      ],
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array',
          readonly: 'array'
        }
      ],
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          ignoreVoid: true,
          ignoreIIFE: true
        }
      ],
      '@typescript-eslint/return-await': 'error',
      '@typescript-eslint/require-await': 'error',
      'import-x/no-namespace': 'error',
      'import-x/no-self-import': 'error',
      'import-x/no-absolute-path': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['scripts/**/*.ts'],
          optionalDependencies: false,
          peerDependencies: false
        }
      ],
      'import-x/no-useless-path-segments': [
        'error',
        {
          noUselessIndex: true
        }
      ],
      'import-x/order': [
        'error',
        {
          groups: [
            'index',
            ['sibling', 'parent'],
            'internal',
            'external',
            'builtin'
          ]
        }
      ],
      'arrow-body-style': 'error',
      'complexity': ['error', { max: 10 }],
      'guard-for-in': 'error',
      'max-classes-per-file': ['error', 1],
      'max-depth': ['error', { max: 2 }],
      'no-bitwise': 'error',
      'no-console': 'error',
      'no-restricted-syntax': ['error', 'ForInStatement'],
      'no-undef-init': 'error',
      'object-shorthand': 'error',
      'one-var': ['error', 'never'],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', next: 'return', prev: '*' }
      ],
      'prefer-arrow-callback': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'radix': 'error'
    }
  },
  {
    files: ['src/**/*spec.ts', 'test/**/*'],
    ...jest.configs['flat/recommended'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/prefer-expect-resolves': 'error',
      'jest/prefer-todo': 'error',
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true
        }
      ]
    }
  }
);
