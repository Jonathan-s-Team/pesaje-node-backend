const dbAdapter = require('../adapters');

const getAll = async ({ includeDeleted = false, clientId, userId, periodId }) => {
    // Define query conditions
    const query = includeDeleted ? {} : { deletedAt: null };

    if (clientId) query.client = clientId;
    if (userId) query.buyer = userId;
    if (periodId) query.period = periodId;

    // Fetch purchases with relations
    return await dbAdapter.purchaseAdapter.getAllWithRelations(query, [
        'buyer',
        'company',
        'broker',
        'client',
    ]);
};

const getById = async (id) => {
    return await dbAdapter.purchaseAdapter.getByIdWithRelations(id, ['buyer', 'company', 'broker', 'client', 'shrimpFarm', 'period']);
};

const create = async (data) => {
    // Define the references and their corresponding adapters
    const references = {
        buyer: 'userAdapter',
        company: 'companyAdapter',
        period: 'periodAdapter',
        broker: 'brokerAdapter',
        client: 'clientAdapter',
        shrimpFarm: 'shrimpFarmAdapter'
    };

    // Validate that all referenced IDs exist
    await Promise.all(Object.entries(references).map(async ([key, adapter]) => {
        const entity = await dbAdapter[adapter].getById(data[key]);
        if (!entity) {
            throw new Error(`${key.charAt(0).toUpperCase() + key.slice(1)} does not exist`);
        }
    }));

    // Create the purchase record
    return await dbAdapter.purchaseAdapter.create(data);
};


const update = async (id, data) => {
    const purchase = await dbAdapter.purchaseAdapter.getById(id);
    if (!purchase) throw new Error('Purchase not found');

    return await dbAdapter.purchaseAdapter.update(id, data);
};

const remove = async (id) => {
    const purchase = await dbAdapter.purchaseAdapter.getById(id);
    if (!purchase) throw new Error('Purchase not found');

    return await dbAdapter.purchaseAdapter.update(id, { deletedAt: new Date() });
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};
