const shortid = require('shortid');

const id = 'abc123'; // Hex-like
console.log(`'${id}' is valid: ${shortid.isValid(id)}`);

const md5Fragment = '8b1a99'; // Hex fragment
console.log(`'${md5Fragment}' is valid: ${shortid.isValid(md5Fragment)}`);
