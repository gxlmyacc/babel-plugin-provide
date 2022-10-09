
const t = require('@babel/types');

function getImportDeclarations(path) {
  let program = path.isProgram() ? path : path.findParent(p => p.isProgram());
  return program.node.body.filter(node => t.isImportDeclaration(node));
}

function isImportLibrary(path, libraryName) {
  let declaration = getImportDeclarations(path).find(node => node.source.value === libraryName);
  return declaration;
}

function isImportSpecifier(path, specifierName, declaration, libraryName) {
  let declarations;
  let [local, imported] = specifierName.split(',');
  if (!declaration) {
    if (libraryName) declaration = isImportLibrary(path, libraryName);
    else declarations = getImportDeclarations(path);
  }
  if (declaration) declarations = [declaration];
  let ret;
  declarations && declarations.some(item => ret = item.specifiers.find(v => {
    if (imported) {
      if (imported === 'default') {
        if (v.type !== 'ImportDefaultSpecifier') return;
      } else {
        if (v.type !== 'ImportSpecifier') return;
      }
    }
    return v.local.name === local;
  }));
  return ret;
}

function importSpecifier(path, specifierName, libraryName) {
  let declaration = isImportLibrary(path, libraryName);

  let [local, imported = specifierName] = specifierName.split(',');
  let specifier = imported === 'default'
    ? t.importDefaultSpecifier(t.identifier(local))
    : t.importSpecifier(t.identifier(local), t.identifier(imported));
  if (declaration) {
    if (!isImportSpecifier(path, specifierName, declaration)) {
      declaration.specifiers.push(specifier);
    }
  } else {
    let program = path.isProgram() ? path : path.findParent(p => p.isProgram());
    program.unshiftContainer('body',  t.importDeclaration(
      [specifier],
      t.stringLiteral(libraryName),
    ));
  }
  return specifier;
}

function importDefaultSpecifier(path, specifierName, libraryName) {
  return importSpecifier(path, `${specifierName},default`, libraryName);
}

module.exports = {
  importDefaultSpecifier
};
