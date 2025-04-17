const dbAdapter = require('../adapters');

const getAllByParams = async ({ userId, controlNumber, includeDeleted = false }) => {
    const saleQuery = includeDeleted ? {} : { deletedAt: null };

    // Build purchase sub-query if filters are provided
    const purchaseQuery = {};
    if (userId) purchaseQuery.buyer = userId;
    if (controlNumber) purchaseQuery.controlNumber = controlNumber;

    // Fetch matching purchases with relations
    const purchases = await dbAdapter.purchaseAdapter.getAllWithRelations(purchaseQuery, ['buyer', 'client']);
    const purchaseIds = purchases.map(p => p.id);

    if ((userId || controlNumber) && purchaseIds.length === 0) return [];

    if (purchaseIds.length > 0) {
        saleQuery.purchase = { $in: purchaseIds };
    }

    // Fetch people (buyers and clients) for fullName resolution
    const personIds = purchases.flatMap(p => [
        p.buyer?.person,
        p.client?.person
    ]).filter(Boolean);

    const persons = await dbAdapter.personAdapter.getAll({ _id: { $in: personIds } });
    const personMap = persons.reduce((acc, p) => {
        acc[p.id] = `${p.names} ${p.lastNames}`.trim();
        return acc;
    }, {});

    // Build purchase lookup with fullNames
    const purchaseMap = purchases.reduce((acc, p) => {
        acc[p.id] = {
            controlNumber: p.controlNumber,
            buyer: p.buyer ? { id: p.buyer.id, fullName: personMap[p.buyer.person] || 'Unknown' } : null,
            client: p.client ? { id: p.client.id, fullName: personMap[p.client.person] || 'Unknown' } : null
        };
        return acc;
    }, {});

    // Get sales with matching purchases
    const sales = await dbAdapter.saleAdapter.getAllWithRelations(saleQuery, ['purchase']);

    // Get related company sales by sale IDs
    const saleIds = sales.map(s => s.id);
    const companySales = await dbAdapter.companySaleAdapter.getAll({ sale: { $in: saleIds }, deletedAt: null });

    const companySaleMap = companySales.reduce((acc, cs) => {
        acc[cs.sale.toString()] = cs;
        return acc;
    }, {});

    // Build final response
    return sales.map(sale => {
        const purchaseData = purchaseMap[sale.purchase?.id];
        const relatedCompanySale = companySaleMap[sale.id] || null;

        return {
            id: sale.id,
            saleDate: sale.saleDate,
            type: sale.type,
            controlNumber: purchaseData?.controlNumber || null,
            total: relatedCompanySale?.grandTotal || 0,
            buyer: purchaseData?.buyer || null,
            client: purchaseData?.client || null
        };
    });
};


module.exports = {
    getAllByParams
};
