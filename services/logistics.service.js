const dbAdapter = require('../adapters');
const LogisticsTypeEnum = require('../enums/logistics-type.enum');

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
            const logisticsCategory = await dbAdapter.logisticsCategoryAdapter.getById(item.logisticsCategory);
            if (!logisticsCategory) throw new Error(`Invalid logisticsCategory: ${item.logisticsCategory}`);

            const createdItem = await dbAdapter.logisticsItemAdapter.create(item, { session: transaction.session });
            createdItems.push(createdItem.id);
        }

        // Create the Logistics document
        const logistics = await dbAdapter.logisticsAdapter.create({
            purchase: data.purchase,
            type: data.type,
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

    const purchaseQuery = {};
    if (userId) purchaseQuery.buyer = userId;
    if (controlNumber) purchaseQuery.controlNumber = controlNumber;

    const purchases = Object.keys(purchaseQuery).length > 0
        ? await dbAdapter.purchaseAdapter.getAllWithRelations(purchaseQuery, ['company'])
        : await dbAdapter.purchaseAdapter.getAllWithRelations({}, ['company']);

    const purchaseMap = purchases.reduce((acc, p) => {
        acc[p.id] = {
            controlNumber: p.controlNumber,
            companyName: p.company?.name || ''
        };
        return acc;
    }, {});
    const purchaseIds = purchases.map(p => p.id);

    if (Object.keys(purchaseQuery).length > 0 && purchaseIds.length === 0) return [];

    if (purchaseIds.length > 0) {
        logisticsQuery.purchase = { $in: purchaseIds };
    }

    const logistics = await dbAdapter.logisticsAdapter.getAllWithRelations(logisticsQuery, [
        { path: 'items', populate: { path: 'logisticsCategory' } }
    ]);

    return logistics.map(log => {
        const purchaseInfo = purchaseMap[log.purchase];
        const controlNumber = purchaseInfo?.controlNumber || null;
        const companyName = purchaseInfo?.companyName || null;

        // 🧠 Determine description
        let description = '';

        if (log.type === LogisticsTypeEnum.SHIPMENT) {
            description = companyName === 'Local' ? 'Envío Local' : 'Envío a Compañia';
        } else if (log.type === LogisticsTypeEnum.LOCAL_PROCESSING) {
            description = 'Procesamiento Local';
        }

        return {
            id: log.id,
            logisticsDate: log.logisticsDate,
            grandTotal: log.grandTotal,
            purchase: log.purchase, // ID
            items: log.items.map(i => i.id),
            controlNumber,
            description,
            deletedAt: log.deletedAt || null,
        };
    });
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
