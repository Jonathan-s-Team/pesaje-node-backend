const { User, Role, Broker, PaymentInfo, Person } = require('../models');
const MongooseGenericAdapter = require('./mongoose-generic-adapter');

// If you have another adapter (e.g., PostgreSQL):
// const PostgresGenericAdapter = require('./pg-generic-adapter'); // Example

// Dynamically select the database
const dbType = process.env.DB_TYPE || 'mongo';

let userAdapter, personAdapter, brokerAdapter, paymentInfoAdapter, roleAdapter;

if (dbType === 'mongo') {
    userAdapter = new MongooseGenericAdapter(User, ['person', 'roles']); // Populate person & roles
    personAdapter = new MongooseGenericAdapter(Person);
    brokerAdapter = new MongooseGenericAdapter(Broker, ['person']); // If Broker has a relation with Person
    paymentInfoAdapter = new MongooseGenericAdapter(PaymentInfo, ['person']); // If PaymentInfo has Person relation
    roleAdapter = new MongooseGenericAdapter(Role);
}
// else if (dbType === 'postgres') {
//     userAdapter = new PostgresGenericAdapter('User'); // Example usage for Sequelize
//     personAdapter = new PostgresGenericAdapter('Person');
// } else {
//     throw new Error(`Unsupported DB_TYPE: ${dbType}`);
// }

module.exports = { userAdapter, personAdapter, brokerAdapter, paymentInfoAdapter, roleAdapter };
