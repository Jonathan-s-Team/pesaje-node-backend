const dbAdapter = require('../adapters');

const getAllByParams = async ({ userId, controlNumber, includeDeleted = false }) => {
    const saleQuery = includeDeleted ? {} : { deletedAt: null };

    const purchaseQuery = {};
    if (userId) purchaseQuery.buyer = userId;
    if (controlNumber) purchaseQuery.controlNumber = controlNumber;

    const purchases = await dbAdapter.purchaseAdapter.getAllWithRelations(purchaseQuery, ['buyer', 'client', 'company']);
    const purchaseIds = purchases.map(p => p.id);

    if ((userId || controlNumber) && purchaseIds.length === 0) return [];

    if (purchaseIds.length > 0) {
        saleQuery.purchase = { $in: purchaseIds };
    }

    const personIds = purchases.flatMap(p => [
        p.buyer?.person,
        p.client?.person
    ]).filter(Boolean);

    const persons = await dbAdapter.personAdapter.getAll({ _id: { $in: personIds } });
    const personMap = persons.reduce((acc, p) => {
        acc[p.id] = `${p.names} ${p.lastNames}`.trim();
        return acc;
    }, {});

    const purchaseMap = purchases.reduce((acc, p) => {
        acc[p.id] = {
            controlNumber: p.controlNumber,
            buyer: p.buyer ? { id: p.buyer.id, fullName: personMap[p.buyer.person] || 'Unknown' } : null,
            client: p.client ? { id: p.client.id, fullName: personMap[p.client.person] || 'Unknown' } : null,
            company: p.company ? { id: p.company.id, name: p.company.name } : null,
        };
        return acc;
    }, {});

    const sales = await dbAdapter.saleAdapter.getAllWithRelations(saleQuery, ['purchase']);
    const saleIds = sales.map(s => s.id);

    const companySales = await dbAdapter.companySaleAdapter.getAll({ sale: { $in: saleIds }, deletedAt: null });
    const companySaleMap = companySales.reduce((acc, cs) => {
        acc[cs.sale.toString()] = cs;
        return acc;
    }, {});
    const companySaleIds = companySales.map(cs => cs.id);

    // 🧮 Get related payment methods
    const payments = await dbAdapter.companySalePaymentMethodAdapter.getAll({
        companySale: { $in: companySaleIds },
        deletedAt: null
    });

    // 🧾 Map of totalPaid by companySaleId
    const paymentMap = payments.reduce((map, payment) => {
        const saleId = payment.companySale.toString();
        map[saleId] = (map[saleId] || 0) + Number(payment.amount);
        return map;
    }, {});

    // 📦 Final response
    return sales.map(sale => {
        const purchaseData = purchaseMap[sale.purchase?.id];
        const relatedCompanySale = companySaleMap[sale.id] || null;

        return {
            id: sale.id,
            saleDate: sale.saleDate,
            type: sale.type,
            controlNumber: purchaseData?.controlNumber || null,
            total: relatedCompanySale?.grandTotal || 0,
            totalPaid: paymentMap[relatedCompanySale?.id] || 0,
            status: relatedCompanySale?.status || null,
            buyer: purchaseData?.buyer || null,
            client: purchaseData?.client || null,
            company: purchaseData?.company || null,
        };
    });
};


const remove = async (id) => {
    const transaction = await dbAdapter.saleAdapter.startTransaction();
    try {
        // Ensure the sale exists
        const sale = await dbAdapter.saleAdapter.getById(id);
        if (!sale) {
            throw new Error('Sale not found');
        }

        const deletedAt = new Date();

        // Soft delete the Sale
        await dbAdapter.saleAdapter.update(id, { deletedAt }, { session: transaction.session });

        // Find all related CompanySales
        const companySales = await dbAdapter.companySaleAdapter.getAll({ sale: id });

        // Soft delete each associated CompanySale
        await Promise.all(companySales.map(cs =>
            dbAdapter.companySaleAdapter.update(cs.id, { deletedAt }, { session: transaction.session })
        ));

        await transaction.commit();
        return { id, deletedAt };
    } catch (error) {
        await transaction.rollback();
        throw new Error(error.message);
    } finally {
        await transaction.end();
    }
};


module.exports = {
    getAllByParams,
    remove,
};
