
const { declare } = require('@babel/helper-plugin-utils');
const { importDefaultSpecifier } = require('./utils');

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
      this.addDefaultImport(path, identifier, provide);
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
            addDefaultImport(path, varName, libraryName) {
              if (typeof libraryName === 'function') libraryName = libraryName(filename, state);
              libraryName && importDefaultSpecifier(path, varName, libraryName);
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
