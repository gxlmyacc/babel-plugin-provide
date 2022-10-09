const path = require('path');

const config = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'commonjs',
        useBuiltIns: 'entry',
        corejs: 2,
        targets: { browsers: ['Chrome >= 49'] }
      }
    ],
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-strict-mode',
    '@babel/plugin-transform-parameters',
    '@babel/plugin-transform-destructuring',
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-json-strings',
    '@babel/plugin-transform-spread',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    '@babel/plugin-transform-arrow-functions',
  ]
};

module.exports = process.env.NODE_ENV === 'production'
  ? config
  : {
    plugins: [
      [
        path.resolve('./src/index.js'),
        {
          _: 'lodash',
          importJs: filename => `./${path.relative(path.dirname(filename), path.join(__dirname, 'demo/src/import-js')).replace(/\\/g, '/')}`,
          $: 'jquery'
        }
      ],
    ]
  };
