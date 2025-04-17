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

const getById = async (id) => {
    const companySale = await dbAdapter.companySaleAdapter.getByIdWithRelations(id, [
        {
            path: 'items'
        },
        {
            path: 'sale'
        }
    ]);

    if (!companySale) throw new Error('Company sale not found');

    return {
        ...companySale,
        items: companySale.items.map(item => ({
            id: item.id,
            style: item.style,
            class: item.class,
            size: item.size,
            pounds: item.pounds,
            price: item.price,
            referencePrice: item.referencePrice,
            total: item.total,
            percentage: item.percentage,
            deletedAt: item.deletedAt
        }))
    };
};

const getBySaleId = async (saleId) => {
    const companySaleList = await dbAdapter.companySaleAdapter.getAllWithRelations(
        { sale: saleId, deletedAt: null },
        ['items']
    );

    const companySale = companySaleList[0];
    if (!companySale) throw new Error('Company sale not found');

    // Fetch Sale with populated purchase and its relations
    const sale = await dbAdapter.saleAdapter.getByIdWithRelations(saleId, [
        {
            path: 'purchase',
            populate: ['buyer', 'broker', 'client', 'company', 'shrimpFarm', 'period']
        }
    ]);

    const purchase = sale?.purchase;
    if (!purchase) throw new Error('Associated purchase not found');

    // Fetch person details
    const personIds = [purchase.buyer?.person, purchase.broker?.person, purchase.client?.person].filter(Boolean);
    const persons = await dbAdapter.personAdapter.getAll({ _id: { $in: personIds } });
    const personMap = persons.reduce((map, p) => {
        map[p.id] = `${p.names} ${p.lastNames}`.trim();
        return map;
    }, {});

    return {
        id: companySale.id,
        sale: companySale.sale,
        saleDate: sale.saleDate,
        document: companySale.document,
        batch: companySale.batch,
        provider: companySale.provider,
        np: companySale.np,
        serialNumber: companySale.serialNumber,
        receptionDateTime: companySale.receptionDateTime,
        settleDateTime: companySale.settleDateTime,
        batchAverageGram: companySale.batchAverageGram,
        wholeReceivedPounds: companySale.wholeReceivedPounds,
        trashPounds: companySale.trashPounds,
        netReceivedPounds: companySale.netReceivedPounds,
        processedPounds: companySale.processedPounds,
        performance: companySale.performance,
        poundsGrandTotal: companySale.poundsGrandTotal,
        grandTotal: companySale.grandTotal,
        percentageTotal: companySale.percentageTotal,
        deletedAt: companySale.deletedAt,
        items: companySale.items.map(item => ({
            id: item.id,
            style: item.style,
            class: item.class,
            size: item.size,
            pounds: item.pounds,
            price: item.price,
            referencePrice: item.referencePrice,
            total: item.total,
            percentage: item.percentage,
            deletedAt: item.deletedAt
        })),
        purchase: {
            id: purchase.id,
            controlNumber: purchase.controlNumber,
            purchaseDate: purchase.purchaseDate,
            buyer: purchase.buyer ? {
                id: purchase.buyer._id,
                fullName: personMap[purchase.buyer.person] || 'Unknown'
            } : null,
            broker: purchase.broker ? {
                id: purchase.broker._id,
                fullName: personMap[purchase.broker.person] || 'Unknown'
            } : null,
            client: purchase.client ? {
                id: purchase.client._id,
                fullName: personMap[purchase.client.person] || 'Unknown'
            } : null,
            company: purchase.company ? {
                id: purchase.company._id,
                name: purchase.company.name
            } : null,
            shrimpFarm: purchase.shrimpFarm ? {
                id: purchase.shrimpFarm._id,
                identifier: purchase.shrimpFarm.identifier,
                place: purchase.shrimpFarm.place
            } : null,
            period: purchase.period ? {
                id: purchase.period._id,
                name: purchase.period.name
            } : null
        }
    };
};

module.exports = {
    create,
    getById,
    getBySaleId,
};
