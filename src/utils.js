const t = require('@babel/types');
const findUp = require('find-up');
const fs = require('fs');
const path = require('path');
const template = require('@babel/template').default;

function formatDate(date, fmt) {
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  Object.keys(o).forEach(k => {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    }
  });
  return fmt;
};

function fileExists(path) {
  try {
    return !fs.accessSync(path, fs.F_OK);
  } catch (e) {
    return false;
  }
}

function getConfigPath(filename) {
  let packagePath = findUp.sync('package.json', {
    cwd: path.dirname(filename),
    type: 'file'
  });
  if (packagePath && fileExists(packagePath)) return packagePath;
}

const NOW = formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss');
const constCached = [];
function getConstCache(filename) {
  const pkgPath = getConfigPath(filename);
  if (!pkgPath || filename === path.resolve(pkgPath)) return {};

  let cwd;

  let cache = constCached[pkgPath];
  if (!cache) {
    let pkg = require(pkgPath);
    if (!pkg || !Object.keys(pkg).length) return {};

    cwd = path.dirname(pkgPath);

    cache = { pkg, cwd };
    constCached[pkgPath] = cache;

    cache.now = NOW;
  }
  cwd = cache.cwd;

  cache.filename = '/' + path.relative(cwd, filename).replace(/\\/g, '/');
  cache.dirname = '/' + path.relative(cwd, path.dirname(filename)).replace(/\\/g, '/');

  return cache;
}

function arr2Expression(arr, parent) {
  let temp = '';
  let vars = {};
  arr.forEach((v, i) => {
    let expr = var2Expression(v, arr);
    if (!expr) return;
    let key = `$${i}`;
    temp += (temp ? ', ' : '') + key;
    vars[key] = expr;
  });
  return template(`[${temp}]`)(vars);
}

function obj2Expression(obj, parent) {
  let props = Object.keys(obj).map(k => {
    let v = obj[k];
    let expr = var2Expression(v, obj);
    if (!expr) return;
    return t.objectProperty(t.identifier(k), expr);
  }).filter(Boolean);
  return t.objectExpression(props);
}

function var2Expression(v, parent) {
  if (t.isNode(v)) return v;
  if (v === undefined) return;
  if (Array.isArray(v)) return arr2Expression(v, parent);
  switch (typeof v) {
    case 'string': return t.stringLiteral(v);
    case 'boolean': return t.booleanLiteral(v);
    case 'number': return t.numericLiteral(v);
    case 'object':
      if (v === null) return t.nullLiteral();
      if (v instanceof RegExp) return t.regExpLiteral(v.source, v.flags);
      if (v instanceof Date) return template('new Date(TIME)')({ TIME: t.numericLiteral(v.getTime()) });
      if (v instanceof Function) return template(v.toString())();
      return obj2Expression(v, parent);
    default: return t.identifier('undefined');
  }
}

module.exports = {
  getConstCache,
  var2Expression,
  arr2Expression,
  obj2Expression
}