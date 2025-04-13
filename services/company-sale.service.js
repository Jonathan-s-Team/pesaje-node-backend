const dbAdapter = require('../adapters');
const SaleTypeEnum = require('../enums/sale-type.enum');

const create = async (data) => {
    const transaction = await dbAdapter.saleAdapter.startTransaction();

    try {
        const { purchase, saleDate, ...companySaleData } = data;

        // Validate referenced purchase exists
        const purchaseExists = await dbAdapter.purchaseAdapter.getById(purchase);
        if (!purchaseExists) {
            throw new Error('Purchase does not exist');
        }

        // Create Sale document
        const sale = await dbAdapter.saleAdapter.create({
            purchase,
            saleDate,
            type: SaleTypeEnum.COMPANY
        }, { session: transaction.session });

        // Create CompanySaleItems
        const itemIds = [];
        for (const item of data.items) {
            const createdItem = await dbAdapter.companySaleItemAdapter.create(item, { session: transaction.session });
            itemIds.push(createdItem.id);
        }

        // Create CompanySale
        const companySale = await dbAdapter.companySaleAdapter.create({
            ...companySaleData,
            sale: sale.id,
            items: itemIds
        }, { session: transaction.session });

        await transaction.commit();
        return companySale;
    } catch (error) {
        await transaction.rollback();
        throw new Error(error.message);
    } finally {
        await transaction.end();
    }
};

module.exports = {
    create,
};
