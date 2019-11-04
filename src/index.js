
const { declare } = require('@babel/helper-plugin-utils');

function addDefaultImport(path, varName, libraryName) {
  path.unshiftContainer(
    'body',
    t.importDeclaration(
      [t.importDefaultSpecifier(t.identifier(varName))],
      t.stringLiteral(libraryName),
    )
  );
}

module.exports = declare(api => {
  api.assertVersion(7);

  let provides;
  function IdentifierVisitor(path) {
    if (!provides) return;
    const parent = path.parent;
    if (!parent) return;

    if (['FunctionDeclaration', 'MemberExpression', 'VariableDeclarator'].includes(parent.type)) return;
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
        enter(path,
          {
            opts = {}
          }) {
          provides = opts;
          path.traverse({
            Identifier: IdentifierVisitor
          }, {
            handled: {}
          });
        },
      },
    }
  };
});
