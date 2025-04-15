const dbAdapter = require('../adapters');

const getSummaryInfoByParams = async ({ includeDeleted = false, clientId, userId, periodId, controlNumber }) => {
    const query = includeDeleted ? {} : { deletedAt: null };
    if (clientId) query.client = clientId;
    if (userId) query.buyer = userId;
    if (periodId) query.period = periodId;
    if (controlNumber) query.controlNumber = controlNumber;

    const purchases = await dbAdapter.purchaseAdapter.getAllWithRelations(query, [
        'buyer',
        'broker',
        'client',
        'shrimpFarm',
        'company',
        'period'
    ]);

    if (purchases.length === 0) return null;
    const purchase = purchases[0];

    const [persons, payments, sales, logistics, companySales] = await Promise.all([
        dbAdapter.personAdapter.getAll({
            _id: {
                $in: [
                    purchase.buyer?.person,
                    purchase.broker?.person,
                    purchase.client?.person
                ].filter(Boolean)
            }
        }),
        dbAdapter.purchasePaymentMethodAdapter.getAll({ purchase: purchase.id, deletedAt: null }),
        dbAdapter.saleAdapter.getAll({ purchase: purchase.id, deletedAt: null }),
        dbAdapter.logisticsAdapter.getAllWithRelations({ purchase: purchase.id, deletedAt: null }, ['items']),
        dbAdapter.companySaleAdapter.getAll({ sale: { $in: await dbAdapter.saleAdapter.getAll({ purchase: purchase.id }).then(sales => sales.map(s => s.id)) } })
    ]);

    const personMap = persons.reduce((map, p) => {
        map[p.id] = `${p.names} ${p.lastNames}`.trim();
        return map;
    }, {});

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    const sale = sales[0];
    const companySale = companySales[0];
    const logisticsRecord = logistics[0];

    const logisticsGrouped = logisticsRecord?.items.reduce((acc, item) => {
        if (!item?.logisticsType) return acc;
        const type = item.logisticsType.status;
        acc[type] = (acc[type] || 0) + item.total;
        return acc;
    }, {}) || {};

    const grossProfit = (companySale?.priceGrandTotal || 0) - (logisticsGrouped.INPUTS || 0) - (logisticsGrouped.PERSONNEL || 0) - (purchase.totalAgreedToPay || 0);

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
            totalToPay: totalPaid,
            totalAgreed: purchase.totalAgreedToPay || 0
        },
        sale: {
            saleDate: sale?.saleDate || '',
            receptionDate: companySale?.receptionDateTime || '',
            batch: companySale?.batch || '',
            document: companySale?.document || '',
            averageBatchGrams: companySale?.batchAverageGram || 0,
            netPoundsReceived: companySale?.netReceivedPounds || 0,
            wholePoundsReceived: companySale?.wholeReceivedPounds || 0,
            trashPounds: companySale?.trashPounds || 0,
            performance: companySale?.performance || 0,
            totalToReceive: companySale?.priceGrandTotal || 0
        },
        logistics: {
            type: logisticsRecord?.type || '',
            logisticsDate: logisticsRecord?.logisticsDate || '',
            personnelExpenses: logisticsGrouped.PERSONNEL || 0,
            productAndSupplyExpenses: logisticsGrouped.INPUTS || 0,
            totalToPay: (logisticsGrouped.PERSONNEL || 0) + (logisticsGrouped.INPUTS || 0)
        }
    };
};

module.exports = {
    getSummaryInfoByParams
};
