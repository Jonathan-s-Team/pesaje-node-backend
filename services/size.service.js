const dbAdapter = require('../adapters');

const getAll = async () => {
    return await dbAdapter.sizeAdapter.getAll();
};

module.exports = {
    getAll,
};
