
const { declare } = require('@babel/helper-plugin-utils');
const t = require('@babel/types');
const path = require('path');

module.exports = declare(api => {
  api.assertVersion(7);

  function IdentifierVisitor(path) {
    if (!this.provides) return;
    const parent = path.parent;
    if (!parent) return;

    if (['FunctionDeclaration', 'MemberExpression', 'VariableDeclarator', 'ImportDefaultSpecifier'].includes(parent.type)) return;
    if (parent.type === 'ObjectProperty' && parent.key === path.node) {
      return;
    }

    let identifier = path.node.name;
    if (this.handled[identifier]) return;
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
        enter(nodePath,
          {
            file: {
              opts: { filename }
            },
            opts = {}
          }) {
          const ctx = {
            provides: opts,
            handled: {},
            addDefaultImport(varName, libraryName) {
              libraryName = path.relative(path.dirname(filename), libraryName).replace(/\\/g, '/');
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
