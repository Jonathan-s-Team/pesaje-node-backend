const dbAdapter = require('../adapters');

const getAll = async (status = null) => {
    const query = status ? { status } : {};
    return await dbAdapter.logisticsTypeAdapter.getAll(query);
};

module.exports = {
    getAll,
};
