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
    if (data.code) {
        // Check if another company already has this code
        const existing = await dbAdapter.companyAdapter.getAll({ code: data.code });
        // Allow update if the existing company with this code is the same as the one being updated
        if (existing.length && String(existing[0].id) !== String(id)) {
            throw new Error('Company code already exists');
        }
        // If existing[0].id === id, allow update to continue
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
