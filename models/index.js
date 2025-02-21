const dbType = process.env.DB_TYPE || 'mongo';

// Load models dynamically based on DB_TYPE
const accountModelsPath = `./${dbType}/account`;
const profileModelsPath = `./${dbType}/profile`;

// Import account models
const User = require(`${accountModelsPath}/user`);
const Role = require(`${accountModelsPath}/role`);
const Option = require(`${accountModelsPath}/option`);
const RolePermission = require(`${accountModelsPath}/role-permission`);

// Import profile models
const Person = require(`${profileModelsPath}/person`);
const Broker = require(`${profileModelsPath}/broker`);
const Client = require(`${profileModelsPath}/client`);
const PaymentInfo = require(`${profileModelsPath}/payment-info`);

console.log(`Using ${dbType.toUpperCase()} Models`);

module.exports = {
    User,
    Role,
    Option,
    RolePermission,
    Person,
    Broker,
    Client,
    PaymentInfo
};
