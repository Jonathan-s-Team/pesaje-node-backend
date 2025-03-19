const dbAdapter = require('../adapters');
const PurchaseStatusEnum = require('../enums/purchase-status.enum');

const getAllByParams = async ({ includeDeleted = false, clientId, userId, periodId, controlNumber }) => {
    // Define query conditions
    const query = includeDeleted ? {} : { deletedAt: null };

    if (clientId) query.client = clientId;
    if (userId) query.buyer = userId;
    if (periodId) query.period = periodId;
    if (controlNumber) query.controlNumber = controlNumber;

    // Fetch purchases with relations
    const purchases = await dbAdapter.purchaseAdapter.getAllWithRelations(query, [
        // 'buyer',
        // 'company',
        // 'broker',
        // 'client',
    ]);

    // Retrieve all payments related to these purchases
    const purchaseIds = purchases.map(p => p.id);
    const payments = await dbAdapter.purchasePaymentMethodAdapter.getAll({
        purchase: { $in: purchaseIds },
        deletedAt: null, // Consider only active payments
    });

    // Remove `buyer.password` from response
    // return purchases.map((purchase) => {
    //     if (purchase.buyer) {
    //         purchase.buyer = {
    //             ...purchase.buyer,
    //             password: undefined, // Remove password field
    //         };
    //     }
    //     return purchase;
    // });

    // Compute totalPayed for each purchase
    const totalPaymentsMap = payments.reduce((acc, payment) => {
        if (!acc[payment.purchase]) {
            acc[payment.purchase] = 0;
        }
        acc[payment.purchase] += payment.amount;
        return acc;
    }, {});

    // Attach `totalPayed` to each purchase
    const result = purchases.map(purchase => ({
        ...purchase,
        totalPayed: totalPaymentsMap[purchase.id] || 0, // Default to 0 if no payments
    }));

    return result;
};

const getById = async (id) => {
    const purchase = await dbAdapter.purchaseAdapter.getByIdWithRelations(id, [
        'buyer',
        'company',
        'broker',
        'client',
        'shrimpFarm',
    ]);

    // Remove `buyer.password` if it exists
    if (purchase && purchase.buyer) {
        purchase.buyer = {
            ...purchase.buyer,
            password: undefined, // Remove password field
        };
    }

    return purchase;
};


const create = async (data) => {
    // Define the references and their corresponding adapters
    const references = {
        buyer: 'userAdapter',
        company: 'companyAdapter',
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

    // Set initial status
    data.status = PurchaseStatusEnum.DRAFT;

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
    getAllByParams,
    getById,
    create,
    update,
    remove
};
