const dbType = process.env.DB_TYPE || 'mongo';

// Load models dynamically based on DB_TYPE
const modelsPath = `./${dbType}/profile`;

const User = require(modelsPath + '/user');
const Person = require(modelsPath + '/person');
const Role = require(modelsPath + '/role');

console.log(`Using ${dbType.toUpperCase()} Models`);

module.exports = { User, Person, Role };
