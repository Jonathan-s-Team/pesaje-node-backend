const MongooseGenericAdapter = require('./mongoose-generic-adapter');
const { User, Person } = require('../models'); // Mongoose models

// If you have another adapter (e.g., PostgreSQL):
const PostgresGenericAdapter = require('./pg-generic-adapter'); // Example

// Dynamically select the database
const dbType = process.env.DB_TYPE || 'mongo';

let userAdapter, roleAdapter;

if (dbType === 'mongo') {
    userAdapter = new MongooseGenericAdapter(User);
    roleAdapter = new MongooseGenericAdapter(Role);
}
// else if (dbType === 'postgres') {
//     userAdapter = new PostgresGenericAdapter('User'); // Example usage for Sequelize
//     personAdapter = new PostgresGenericAdapter('Person');
// } else {
//     throw new Error(`Unsupported DB_TYPE: ${dbType}`);
// }

module.exports = { userAdapter };
