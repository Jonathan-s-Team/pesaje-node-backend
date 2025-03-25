const dbAdapter = require('../adapters');

const create = async (data) => {
    const transaction = await dbAdapter.logisticsAdapter.startTransaction();
    try {
        const purchase = await dbAdapter.purchaseAdapter.getById(data.purchase);
        if (!purchase) {
            throw new Error('Purchase does not exist');
        }

        // Validate and create each LogisticsItem
        const createdItems = [];
        for (const item of data.items) {
            const logisticsType = await dbAdapter.logisticsTypeAdapter.getById(item.logisticsType);
            if (!logisticsType) throw new Error(`Invalid logisticsType: ${item.logisticsType}`);

            const createdItem = await dbAdapter.logisticsItemAdapter.create(item, { session: transaction.session });
            createdItems.push(createdItem.id);
        }

        // Create the Logistics document
        const logistics = await dbAdapter.logisticsAdapter.create({
            purchase: data.purchase,
            logisticsDate: data.logisticsDate,
            grandTotal: data.grandTotal,
            items: createdItems
        }, { session: transaction.session });
        await transaction.commit();
        return logistics;

    } catch (error) {
        await transaction.rollback();
        throw new Error(error.message);
    } finally {
        await transaction.end();
    }
};

const getAllByParams = async ({ userId, controlNumber, includeDeleted = false }) => {
    const logisticsQuery = includeDeleted ? {} : { deletedAt: null };

    // If neither userId nor controlNumber is provided, just return all logistics
    if (!userId && !controlNumber) {
        // return await dbAdapter.logisticsAdapter.getAllWithRelations(logisticsQuery, [
        //     { path: 'purchase', populate: { path: 'buyer' } },
        //     { path: 'items', populate: { path: 'logisticsType' } }
        // ]);
        return await dbAdapter.logisticsAdapter.getAllWithRelations(logisticsQuery, []);
    }

    const purchaseQuery = {};
    if (userId) purchaseQuery.buyer = userId;
    if (controlNumber) purchaseQuery.controlNumber = Number(controlNumber);

    const purchases = await dbAdapter.purchaseAdapter.getAll(purchaseQuery);
    const purchaseIds = purchases.map(p => p.id);

    if (purchaseIds.length === 0) return [];

    logisticsQuery.purchase = { $in: purchaseIds };

    return await dbAdapter.logisticsAdapter.getAllWithRelations(logisticsQuery, []);
};




const getById = async (id) => {
    const logistics = await dbAdapter.logisticsAdapter.getByIdWithRelations(id, []);
    if (!logistics) throw new Error('Logistics not found');
    return logistics;
};

const update = async (id, data) => {
    const transaction = await dbAdapter.logisticsAdapter.startTransaction();
    try {
        const existingLogistics = await dbAdapter.logisticsAdapter.getById(id);
        if (!existingLogistics) {
            throw new Error('Logistics record not found');
        }

        // 🔥 Real deletion of each LogisticsItem using removePermanently
        for (const itemId of existingLogistics.items) {
            await dbAdapter.logisticsItemAdapter.removePermanently(itemId);
        }

        // 🔁 Create new LogisticsItems
        const newItemIds = [];
        for (const item of data.items) {
            const logisticsType = await dbAdapter.logisticsTypeAdapter.getById(item.logisticsType);
            if (!logisticsType) throw new Error(`Invalid logisticsType: ${item.logisticsType}`);

            const newItem = await dbAdapter.logisticsItemAdapter.create(item, { session: transaction.session });
            newItemIds.push(newItem.id);
        }
        // ✏️ Update Logistics record
        const updatedLogistics = await dbAdapter.logisticsAdapter.update(
            id,
            {
                logisticsDate: data.logisticsDate,
                grandTotal: data.grandTotal,
                items: newItemIds
            },
            { session: transaction.session }
        );

        await transaction.commit();
        return updatedLogistics;
    } catch (error) {
        await transaction.rollback();
        throw new Error(error.message);
    } finally {
        await transaction.end();
    }
};



const remove = async (id) => {
    const logistics = await dbAdapter.logisticsAdapter.getById(id);
    if (!logistics) throw new Error('Logistics not found');
    return await dbAdapter.logisticsAdapter.update(id, { deletedAt: new Date() });
};

module.exports = {
    create,
    getAllByParams,
    getById,
    update,
    remove
};
