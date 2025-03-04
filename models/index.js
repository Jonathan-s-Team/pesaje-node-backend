const dbType = process.env.DB_TYPE || 'mongo';

// Load models dynamically based on DB_TYPE
const accountModelsPath = `./${dbType}/account`;
const profileModelsPath = `./${dbType}/profile`;
const clientModelsPath = `./${dbType}/client`;
const priceModelsPath = `./${dbType}/price`;
const purchaseModelsPath = `./${dbType}/purchase`;

// Import account models
const User = require(`${accountModelsPath}/user`);
const Role = require(`${accountModelsPath}/role`);
const Option = require(`${accountModelsPath}/option`);
const RolePermission = require(`${accountModelsPath}/role-permission`);

// Import profile models
const Person = require(`${profileModelsPath}/person`);
const Broker = require(`${profileModelsPath}/broker`);
const PaymentInfo = require(`${profileModelsPath}/payment-info`);

// Import client models
const Client = require(`${clientModelsPath}/client`);
const ShrimpFarm = require(`${clientModelsPath}/shrimp-farm`);

// Import client models
const Size = require(`${priceModelsPath}/size`);
const Company = require(`${priceModelsPath}/company`);
const Period = require(`${priceModelsPath}/period`);
const SizePrice = require(`${priceModelsPath}/size-price`);

// Import pruchase models
const Purchase = require(`${purchaseModelsPath}/purchase`);

console.log(`Using ${dbType.toUpperCase()} Models`);

module.exports = {
    User,
    Role,
    Option,
    RolePermission,
    Person,
    Broker,
    Client,
    PaymentInfo,
    ShrimpFarm,
    Size,
    Company,
    Period,
    SizePrice,
    Purchase,
};
