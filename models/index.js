const dbType = process.env.DB_TYPE || 'mongo';

// Load models dynamically based on DB_TYPE
const controlModelsPath = `./${dbType}/control`;
const accountModelsPath = `./${dbType}/account`;
const profileModelsPath = `./${dbType}/profile`;
const clientModelsPath = `./${dbType}/client`;
const priceModelsPath = `./${dbType}/price`;
const purchaseModelsPath = `./${dbType}/purchase`;
const logisticsModelsPath = `./${dbType}/logistics`;

// Import control models
const Counter = require(`${controlModelsPath}/counter`);

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

// Import purchase models
const Purchase = require(`${purchaseModelsPath}/purchase`);
const PaymentMethod = require(`${purchaseModelsPath}/payment-method`);
const PurchasePaymentMethod = require(`${purchaseModelsPath}/purchase-payment-method`);

// Import logistics models
const Logistics = require(`${logisticsModelsPath}/logistics`);
const LogisticsItem = require(`${logisticsModelsPath}/logistics-item`);
const LogisticsType = require(`${logisticsModelsPath}/logistics-type`);

console.log(`Using ${dbType.toUpperCase()} Models`);

module.exports = {
    Counter,
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
    PaymentMethod,
    PurchasePaymentMethod,
    Logistics,
    LogisticsItem,
    LogisticsType
};
