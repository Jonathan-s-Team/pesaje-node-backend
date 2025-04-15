const dbAdapter = require('../adapters');

const getAllByParams = async ({ userId, controlNumber, includeDeleted = false }) => {
    // Build query for Sale
    const saleQuery = includeDeleted ? {} : { deletedAt: null };

    // Build purchase sub-query if filters are provided
    const purchaseQuery = {};
    if (userId) purchaseQuery.buyer = userId;
    if (controlNumber) purchaseQuery.controlNumber = controlNumber;

    // Fetch matching purchases
    const purchases = await dbAdapter.purchaseAdapter.getAll(purchaseQuery);
    const purchaseIds = purchases.map(p => p.id);

    // If no purchase matches, return empty array
    if ((userId || controlNumber) && purchaseIds.length === 0) return [];

    if (purchaseIds.length > 0) {
        saleQuery.purchase = { $in: purchaseIds };
    }

    // Get sales with matching purchases
    const sales = await dbAdapter.saleAdapter.getAllWithRelations(saleQuery, ['purchase']);

    // Get related company sales by sale IDs
    const saleIds = sales.map(s => s.id);
    const companySales = await dbAdapter.companySaleAdapter.getAll({ sale: { $in: saleIds }, deletedAt: null });

    // Create a lookup map for companySales
    const companySaleMap = companySales.reduce((acc, cs) => {
        acc[cs.sale.toString()] = cs;
        return acc;
    }, {});

    // Build final response
    return sales.map(sale => {
        const relatedCompanySale = companySaleMap[sale.id] || null;
        return {
            id: sale.id,
            saleDate: sale.saleDate,
            type: sale.type,
            controlNumber: sale.purchase?.controlNumber || null,
            total: relatedCompanySale?.grandTotal || 0
        };
    });
};

module.exports = {
    getAllByParams
};
