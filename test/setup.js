require('babel-register')();

require('fs')
  .readdirSync(__dirname)
  .filter(file => file.indexOf('test-') === 0)
  .forEach(file => require(require('path').resolve(__dirname, file)));
