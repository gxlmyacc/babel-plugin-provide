const path = require('path');

module.exports = {
  presets: [
  ],
  plugins: [
    [
      path.resolve('../../src/index.js'), {
        _: 'lodash',
        importJs: filename => path.relative(path.dirname(filename), 'import-js').replace(/\\/g, '/'),
        $: 'jquery'
      }
    ],
  ]
};
