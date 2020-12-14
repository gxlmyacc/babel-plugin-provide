"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _jquery = _interopRequireDefault(require("../../jquery"));

var _lodash = _interopRequireDefault(require("../../lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function test() {
  _lodash.default.defaultsDeep({}, {});

  (0, _jquery.default)(document.body);

  _jquery.default.each([], {});

  let a;
  a.$.dd('dd');
}

var _default = test;
exports.default = _default;