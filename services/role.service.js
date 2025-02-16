
const { Role } = require('../models');


const getAll = async () => {
    return await Role.find();
};

module.exports = {
    getAll,
};