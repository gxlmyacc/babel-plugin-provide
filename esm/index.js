"use strict";

const _require = require('@babel/helper-plugin-utils'),
      declare = _require.declare;

const t = require('@babel/types');

function addDefaultImport(path, varName, libraryName) {
  path.unshiftContainer('body', t.importDeclaration([t.importDefaultSpecifier(t.identifier(varName))], t.stringLiteral(libraryName)));
}

module.exports = declare(function (api) {
  api.assertVersion(7);
  let provides;

  function IdentifierVisitor(path) {
    if (!provides) return;
    const parent = path.parent;
    if (!parent) return;
    if (['FunctionDeclaration', 'MemberExpression', 'VariableDeclarator', 'ImportDefaultSpecifier'].includes(parent.type)) return;

    if (parent.type === 'ObjectProperty' && parent.key === path.node) {
      return;
    }

    let identifier = path.node.name;
    if (this.handled[identifier]) return;
    this.handled[identifier] = true;
    let provide = provides[identifier];

    if (provide) {
      addDefaultImport(path, identifier, provide);
    }
  }

  return {
    name: 'babel-plugin-provide',
    visitor: {
      Program: {
        enter(path, _ref) {
          let _ref$opts = _ref.opts,
              opts = _ref$opts === void 0 ? {} : _ref$opts;
          provides = opts;
          path.traverse({
            Identifier: IdentifierVisitor
          }, {
            handled: {}
          });
        }

      }
    }
  };
});