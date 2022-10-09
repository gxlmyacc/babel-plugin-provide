# babel-plugin-provide
a babel provide that like webpack-provode-plugin that convert global variables to local references.

[![NPM version](https://img.shields.io/npm/v/babel-plugin-provide.svg?style=flat)](https://npmjs.com/package/babel-plugin-provide)
[![NPM downloads](https://img.shields.io/npm/dm/babel-plugin-provide.svg?style=flat)](https://npmjs.com/package/babel-plugin-provide)

## installtion

```bash
  npm install --save-dev babel-plugin-provide
  // or 
  yarn add -D babel-plugin-provide
```

## config


```js
const path = require('path');

// babel.config.js
module.exports = {
  presets: [
  ],
  plugins: [
    [
      'babel-plugin-provide',
      {
        _: 'lodash',
        importJs: filename => `./${path.relative(path.dirname(filename), path.join(__dirname, 'demo/src/import-js')).replace(/\\/g, '/')}`,
        $: 'jquery'
      }
    ],
   ...
  ]
};
```

## demo

source file:
```js
function test() {
   _.defaultsDeep({}, {});
   $(document.body);
   $.each([], {});
   let a;
   a.$.dd('dd');

   importJs('http://www.xxxx.com/something.js');
}

export default test;

```

source file will transform that:

```js
import importJs from "./import-js";
import $ from "jquery";
import _ from "lodash";

function test() {
  _.defaultsDeep({}, {});

  $(document.body);
  $.each([], {});
  let a;
  a.$.dd('dd');
  importJs('http://www.xxxx.com/something.js');
}

export default test;
```
