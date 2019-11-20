/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// ESlint config
module.exports = {
  'env': {
    'browser': true,
    'es6': true,
  },
  'parserOptions': {
    'ecmaVersion': 2017,
    'sourceType': 'module',
  },
  'plugins': ['jsdoc'],
  'extends': ['eslint:recommended', 'google', 'plugin:jsdoc/recommended'],
  'settings': {
    'jsdoc': {
      // Tell the jsdoc linter that we have some Closure-specific tags.
      'mode': 'closure',
      // Use these alternatives (return, const) instead of the longer versions.
      // This is also for Closure compatibility.
      'tagNamePreference': {
        'returns': 'return',
        'constant': 'const',
      },
    },
  },
  'rules': {
    // Deprecated and replaced by community jsdoc plugin:
    'valid-jsdoc': 'off',

    // Configuration for the community plugin, on top of the recommended
    // defaults:
    'jsdoc/no-undefined-types': [
      'error',
      {
        // These types are browser-provided, so trust that they exist.
        'definedTypes': [
          'MediaKeySystemConfiguration',
          'MediaKeySystemMediaCapability',
        ],
      },
    ],

    // Allow the special "/*!" header format used by browserify-header:
    'spaced-comment': [
      'error',
      'always',
      {
        'markers': ['!'],
      },
    ],

    // "Possible error" rules:
    'no-async-promise-executor': 'error',
    'no-await-in-loop': 'error',
    'no-empty': ['error', {'allowEmptyCatch': true}],
    'no-misleading-character-class': 'error',
    'no-template-curly-in-string': 'error',
    'require-atomic-updates': 'error',

    // "Best practices" rules:
    'accessor-pairs': 'error',
    'array-callback-return': 'error',
    // causes issues when implementing an interface
    'class-methods-use-this': 'off',
    'consistent-return': 'error',
    'dot-location': ['error', 'property'],
    'no-alert': 'error',
    'no-caller': 'error',
    'no-div-regex': 'error',
    'no-extend-native': 'error',
    'no-extra-label': 'error',
    'no-floating-decimal': 'error',
    'no-implicit-coercion': ['error', {'allow': ['!!']}],
    'no-implied-eval': 'error',
    'no-invalid-this': 'error',
    'no-iterator': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-multi-spaces': ['error', {'ignoreEOLComments': true}],
    'no-multi-str': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-octal-escape': 'error',
    'no-proto': 'error',
    'no-return-assign': 'error',
    'no-return-await': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-useless-call': 'error',
    'no-useless-catch': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'no-void': 'error',
    'radix': ['error', 'always'],
    'require-await': 'error',
    'wrap-iife': ['error', 'inside'],
    'yoda': ['error', 'never'],

    // "Variables" rules:
    'no-label-var': 'error',
    'no-shadow-restricted-names': 'error',

    // "Stylistic Issues" rules:
    'array-bracket-newline': ['error', 'consistent'],
    'block-spacing': ['error', 'always'],
    'brace-style': ['error', '1tbs', {'allowSingleLine': true}],
    'id-blacklist': ['error', 'async'],
    'lines-between-class-members': 'error',
    'max-statements-per-line': ['error', {'max': 1}],
    'new-parens': 'error',
    'no-mixed-operators': [
      'error', {
        'groups': [['&', '|', '^', '~', '<<', '>>', '>>>', '&&', '||']],
        'allowSamePrecedence': false,
      },
    ],
    'no-restricted-syntax': [
      'error',
      {
        'selector': ':not(MethodDefinition) > FunctionExpression',
        'message': 'Use arrow functions instead of "function" functions.',
      },
      {
        'selector': 'CallExpression[callee.property.name="forEach"] >' +
                    ':function[params.length=1]',
        'message': 'Use for-of instead of forEach',
      },
      {
        'selector': 'BinaryExpression[operator=/^([<>!=]=?)$/] > ' +
                    'CallExpression[callee.property.name=indexOf]',
        'message': 'Use Array.includes instead of indexOf.',
      },
    ],
    'no-whitespace-before-property': 'error',
    'nonblock-statement-body-position': ['error', 'below'],
    'operator-assignment': 'error',

    // "ECMAScript 6" rules:
    'arrow-spacing': 'error',
    'no-useless-constructor': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': ['error', {'ignoreReadBeforeAssign': true}],
  },
};
