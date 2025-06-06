const dbAdapter = require('../adapters');

const getAll = async () => {
    return await dbAdapter.companyAdapter.getAll();
};

const getById = async (id) => {
    return await dbAdapter.companyAdapter.getById(id);
};

const create = async (data) => {
    return await dbAdapter.companyAdapter.create(data);
};

const update = async (id, data) => {
    const company = await dbAdapter.companyAdapter.getById(id);
    if (!company) {
        throw new Error('Company not found');
    }
    return await dbAdapter.companyAdapter.update(id, data);
};

const remove = async (id) => {
    const company = await dbAdapter.companyAdapter.getById(id);
    if (!company) {
        throw new Error('Company not found');
    }
    // Soft delete: set deletedAt timestamp
    return await dbAdapter.companyAdapter.update(id, { deletedAt: new Date() });
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
};
