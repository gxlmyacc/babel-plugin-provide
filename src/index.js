
const {
  getConstCache,
  var2Expression
} = require('./utils');

module.exports = function ({ types: t }) {
  function IdentifierVisitor(path, { opts, cache }) {
    const parent = path.parent;
    if (!parent) return;
    if (['FunctionDeclaration', 'ClassMethod', 'ObjectMethod'].includes(parent.type)) return;
    if (parent.type === 'ObjectProperty' && parent.key === path.node) return;
    if (parent.type === 'MemberExpression' && parent.object !== path.node) return;
    if (parent.type === 'VariableDeclarator' && parent.id === path.node) return;

    const defines = (opts && opts.defines) || {};
    const identifier = path.node.name;
    if (identifier === '__filename') {
      path.replaceWith(t.stringLiteral(cache.filename));
    } else if (identifier === '__dirname') {
      path.replaceWith(t.stringLiteral(cache.dirname));
    } else if (identifier === '__now') {
      path.replaceWith(t.stringLiteral(cache.now));
    } else if (identifier === '__timestamp') {
      path.replaceWith(t.numericLiteral(Date.now()));
    } else if (defines[identifier] !== undefined) {
      path.replaceWith(var2Expression(defines[identifier]));
    } else if (cache.pkg) {
      if (identifier === '__packagename') {
        path.replaceWith(t.stringLiteral(cache.pkg.name));
      } else if (identifier === '__packageversion') {
        path.replaceWith(t.stringLiteral(cache.pkg.version));
      }
    }
  }

  return {
    visitor: {
      Program: {
        enter(path, state) {
          const {
            file: {
              opts: { filename }
            },
            opts,
          } = state;
          const cache = getConstCache(filename);

          path.traverse({
            Identifier: IdentifierVisitor
          }, {
            cache,
            opts
          });
        },
      },
    }
  };
};
