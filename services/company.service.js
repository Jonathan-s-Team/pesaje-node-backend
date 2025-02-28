const dbAdapter = require('../adapters');

const getAll = async () => {
    return await dbAdapter.companyAdapter.getAll();
};

module.exports = {
    getAll,
};
