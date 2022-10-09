
const { declare } = require('@babel/helper-plugin-utils');
const t = require('@babel/types');
// const path = require('path');

module.exports = declare(api => {
  api.assertVersion(7);

  function IdentifierVisitor(path) {
    if (!this.provides) return;
    const parent = path.parent;
    if (!parent) return;

    if (['FunctionDeclaration', 'ClassMethod', 'ObjectMethod'].includes(parent.type)) return;
    if (parent.type === 'ObjectProperty' && parent.key === path.node) return;
    if (parent.type === 'MemberExpression' && parent.object !== path.node) return;
    if (parent.type === 'VariableDeclarator' && parent.id === path.node) return;

    let identifier = path.node.name;
    if (path.scope.bindings[identifier] || this.handled[identifier]) return;
    this.handled[identifier] = true;

    let provide = this.provides[identifier];
    if (provide) {
      this.addDefaultImport(identifier, provide);
    }
  }

  return {
    name: 'babel-plugin-provide',
    visitor: {
      Program: {
        enter(nodePath, state) {
          const {
            file: {
              opts: { filename }
            },
            opts = {}
          } = state;

          const ctx = {
            provides: opts,
            handled: {},
            addDefaultImport(varName, libraryName) {
              if (typeof libraryName === 'function') libraryName = libraryName(filename, state);
              // libraryName = path.relative(path.dirname(filename), libraryName).replace(/\\/g, '/');
              nodePath.unshiftContainer(
                'body',
                t.importDeclaration(
                  [t.importDefaultSpecifier(t.identifier(varName))],
                  t.stringLiteral(libraryName),
                )
              );
            }
          };
          nodePath.traverse({
            Identifier: IdentifierVisitor
          }, ctx);
        },
      },
    }
  };
});
