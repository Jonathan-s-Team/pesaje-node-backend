const dbAdapter = require('../adapters');
const SaleTypeEnum = require('../enums/sale-type.enum');

const create = async (data) => {
    const transaction = await dbAdapter.localSaleAdapter.startTransaction();

    try {
        const {
            purchase,
            saleDate,
            wholeTotalPounds,
            tailTotalPounds,
            wholeRejectedPounds,
            trashPounds,
            totalProcessedPounds,
            details
        } = data;

        // 🔍 Validate referenced Purchase
        const purchaseExists = await dbAdapter.purchaseAdapter.getById(purchase);
        if (!purchaseExists) throw new Error('Purchase does not exist');

        // 📦 Create Sale document
        const sale = await dbAdapter.saleAdapter.create({
            purchase,
            saleDate,
            type: SaleTypeEnum.LOCAL
        }, { session: transaction.session });

        const detailIds = [];

        // 🧾 Create LocalSaleDetails and Items
        for (const detail of details) {
            const itemIds = [];

            for (const item of detail.items) {
                const createdItem = await dbAdapter.localSaleDetailItemAdapter.create(item, { session: transaction.session });
                itemIds.push(createdItem.id);
            }

            const createdDetail = await dbAdapter.localSaleDetailAdapter.create({
                style: detail.style,
                merchat: detail.merchat,
                grandTotal: detail.grandTotal,
                poundsGrandTotal: detail.poundsGrandTotal,
                items: itemIds
            }, { session: transaction.session });

            detailIds.push(createdDetail.id);
        }

        // 📥 Create LocalSale document
        const localSale = await dbAdapter.localSaleAdapter.create({
            sale: sale.id,
            wholeTotalPounds,
            tailTotalPounds,
            wholeRejectedPounds,
            trashPounds,
            totalProcessedPounds,
            details: detailIds
        }, { session: transaction.session });

        await transaction.commit();
        return localSale;
    } catch (error) {
        await transaction.rollback();
        throw new Error(error.message);
    } finally {
        await transaction.end();
    }
};

module.exports = { create };
