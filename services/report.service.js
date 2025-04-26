const dbAdapter = require('../adapters');

const getSummaryInfoByParams = async ({ includeDeleted = false, clientId, userId, periodId, controlNumber }) => {
    const query = includeDeleted ? {} : { deletedAt: null };
    if (clientId) query.client = clientId;
    if (userId) query.buyer = userId;
    if (periodId) query.period = periodId;
    if (controlNumber) query.controlNumber = controlNumber;

    const purchases = await dbAdapter.purchaseAdapter.getAllWithRelations(query, [
        'buyer', 'broker', 'client', 'shrimpFarm', 'company', 'period'
    ]);

    const purchase = purchases.find(p => !p.deletedAt);
    if (!purchase) return null;

    const persons = await dbAdapter.personAdapter.getAll({
        _id: [
            purchase.buyer?.person,
            purchase.broker?.person,
            purchase.client?.person
        ].filter(Boolean)
    });
    const personMap = persons.reduce((map, p) => {
        map[p.id] = `${p.names} ${p.lastNames}`.trim();
        return map;
    }, {});

    const sales = await dbAdapter.saleAdapter.getAll({ purchase: purchase.id, deletedAt: null });
    const sale = sales.find(s => !s.deletedAt);
    if (!sale) return null;

    const [companySales, localSales] = await Promise.all([
        dbAdapter.companySaleAdapter.getAll({ sale: sale.id, deletedAt: null }),
        dbAdapter.localSaleAdapter.getAll({ sale: sale.id, deletedAt: null })
    ]);

    const companySale = companySales.find(cs => !cs.deletedAt);
    const localSale = localSales.find(ls => !ls.deletedAt);
    const isCompany = !!companySale;
console.log(localSale)
    const logisticsList = await dbAdapter.logisticsAdapter.getAllWithRelations(
        { purchase: purchase.id, deletedAt: null },
        [{ path: 'items', populate: { path: 'logisticsCategory' } }]
    );
    const logisticsRecord = logisticsList.find(l => !l.deletedAt);

    const logisticsGrouped = logisticsRecord?.items.reduce((acc, item) => {
        if (!item?.logisticsCategory) return acc;
        const category = item.logisticsCategory.category;
        acc[category] = (acc[category] || 0) + item.total;
        return acc;
    }, {}) || {};

    const grossProfit = ((isCompany ? companySale?.grandTotal : 0) || 0)
        - (logisticsGrouped.INPUTS || 0)
        - (logisticsGrouped.PERSONNEL || 0)
        - (purchase.totalAgreedToPay || 0);

    return {
        grossProfit,
        purchase: {
            clientName: personMap[purchase.client?.person] || '',
            shrimpFarmLocation: purchase.shrimpFarm?.place || '',
            shrimpFarm: purchase.shrimpFarm?.identifier || '',
            responsibleBuyer: personMap[purchase.buyer?.person] || '',
            controlNumber: purchase.controlNumber || '',
            companyName: purchase.company?.name || '',
            period: purchase.period?.name || '',
            brokerName: personMap[purchase.broker?.person] || '',
            purchaseDate: purchase.purchaseDate || '',
            averageGram: purchase.averageGrams || 0,
            invoiceNumber: purchase.invoice || '',
            status: purchase.status || '',
            price: purchase.price || 0,
            pounds: purchase.pounds || 0,
            averageGrams2: purchase.averageGrams2 || 0,
            price2: purchase.price2 || 0,
            pounds2: purchase.pounds2 || 0,
            totalPoundsPurchased: purchase.totalPounds || 0,
            totalToPay: purchase.grandTotal,
            totalAgreed: purchase.totalAgreedToPay || 0
        },
        sale: isCompany ? {
            saleDate: sale?.saleDate || '',
            receptionDate: companySale?.receptionDateTime || '',
            batch: companySale?.batch || '',
            document: companySale?.document || '',
            averageBatchGrams: companySale?.batchAverageGram || 0,
            netPoundsReceived: companySale?.netReceivedPounds || 0,
            wholePoundsReceived: companySale?.wholeReceivedPounds || 0,
            trashPounds: companySale?.trashPounds || 0,
            performance: companySale?.performance || 0,
            totalToReceive: companySale?.grandTotal || 0
        } : {
            saleDate: sale?.saleDate || '',
            wholeTotalPounds: localSale?.wholeTotalPounds || 0,
            tailTotalPounds: localSale?.tailTotalPounds || 0,
            wholeRejectedPounds: localSale?.wholeRejectedPounds || 0,
            trashPounds: localSale?.trashPounds || 0,
            totalProcessedPounds: localSale?.totalProcessedPounds || 0,
            totalToReceive: localSale?.grandTotal || 0
        },
        logistics: {
            type: logisticsRecord?.type || '',
            logisticsDate: logisticsRecord?.logisticsDate || '',
            personnelExpenses: logisticsGrouped.PERSONNEL || 0,
            productAndSupplyExpenses: logisticsGrouped.INPUTS || 0,
            totalToPay: (logisticsGrouped.PERSONNEL || 0) + (logisticsGrouped.INPUTS || 0)
        },
        isCompanySale: isCompany
    };
};


module.exports = {
    getSummaryInfoByParams
};
