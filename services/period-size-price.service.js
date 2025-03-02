const dbAdapter = require('../adapters');

const getByIdAndCompany = async (id, companyId) => {
    if (!id || !companyId) {
        throw new Error('Both id and companyId are required');
    }

    // Find the period by name and company
    const periods = await dbAdapter.periodAdapter.getAllWithRelations(
        { _id: id, company: companyId },
        ['company']
    );

    if (!periods.length) return null;

    const period = periods[0]; // Get the first matching period

    // Fetch all related `sizePrices` for the found period
    const sizePrices = await dbAdapter.sizePriceAdapter.getAllWithRelations(
        { period: period.id },
        ['size']
    );

    return { ...period, sizePrices };
};

const getAllByCompany = async (companyId) => {
    if (!companyId) {
        throw new Error('CompanyId is required');
    }

    // Find the periods by company
    const periods = await dbAdapter.periodAdapter.getAll({ company: companyId });

    // Sort periods by name (MM-YYYY)
    periods.sort((a, b) => {
        const [monthA, yearA] = a.name.split('-').map(Number);
        const [monthB, yearB] = b.name.split('-').map(Number);

        return yearA - yearB || monthA - monthB; // Sort by year first, then month
    });

    return periods;
};

const create = async (data) => {
    // ✅ Validate `sizePrices` BEFORE starting the transaction
    if (data.sizePrices && !Array.isArray(data.sizePrices)) {
        throw new Error('sizePrices must be an array');
    }

    // Extract size IDs from the request
    const sizeIds = data.sizePrices ? data.sizePrices.map(sp => sp.sizeId) : [];

    // Validate all sizes exist
    if (sizeIds.length > 0) {
        const existingSizes = await dbAdapter.sizeAdapter.getAll({ _id: { $in: sizeIds } });

        if (existingSizes.length !== sizeIds.length) {
            throw new Error('One or more sizes do not exist');
        }
    }

    // ✅ Ensure `sizePrices` contain valid `sizeId` & `price` before transaction
    if (data.sizePrices) {
        for (const sp of data.sizePrices) {
            if (!sp.sizeId || typeof sp.price !== 'number') {
                throw new Error(`Missing or invalid price for sizeId: ${sp.sizeId || 'unknown'}`);
            }
        }
    }

    // ✅ Now start the transaction
    const transaction = await dbAdapter.periodAdapter.startTransaction();
    const session = transaction.session;

    try {
        // ✅ Check if the period already exists
        const existingPeriod = await dbAdapter.periodAdapter.getAll(
            { name: data.name, company: data.company },
            { session }
        );

        if (existingPeriod.length > 0) {
            throw new Error(`A period with the name "${data.name}" already exists for this company.`);
        }

        // ✅ Validate company exists
        const companyExists = await dbAdapter.companyAdapter.getById(data.company, { session });
        if (!companyExists) {
            throw new Error('Company does not exist');
        }

        // ✅ Create the Period only after validation
        const period = await dbAdapter.periodAdapter.create(
            { name: data.name, company: data.company },
            { session }
        );

        // ✅ Create SizePrice records
        let sizePrices = [];
        if (data.sizePrices) {
            sizePrices = await Promise.all(
                data.sizePrices.map(async (sp) => {
                    return dbAdapter.sizePriceAdapter.create(
                        { size: sp.sizeId, price: sp.price, period: period.id },
                        { session }
                    );
                })
            );
        }

        // ✅ Commit transaction (Save everything if successful)
        await transaction.commit();
        transaction.end();

        return { ...period, sizePrices };
    } catch (error) {
        await transaction.rollback(); // Rollback changes if anything fails
        transaction.end();
        throw new Error(error.message); // Ensure error is thrown back to API
    }
};




const update = async (periodId, data) => {
    const { name, sizePrices } = data;

    // Find the period
    const period = await dbAdapter.periodAdapter.getById(periodId);
    if (!period) {
        throw new Error('Period not found');
    }

    // If `sizePrices` is provided, validate that all `sizeId`s exist first
    if (sizePrices && sizePrices.length > 0) {
        const sizeIds = sizePrices.map(sp => sp.sizeId);
        const existingSizes = await dbAdapter.sizeAdapter.getAll({ _id: { $in: sizeIds } });

        if (existingSizes.length !== sizeIds.length) {
            throw new Error('One or more sizeIds provided do not exist. No updates were performed.');
        }
    }

    // Start applying updates only if all checks pass
    if (name) {
        await dbAdapter.periodAdapter.update(periodId, { name });
    }

    // Update or create sizePrices
    if (sizePrices && sizePrices.length > 0) {
        for (let sp of sizePrices) {
            const existingSizePrice = await dbAdapter.sizePriceAdapter.getAll({
                size: sp.sizeId,
                period: period.id
            });

            if (existingSizePrice.length > 0) {
                // Update existing sizePrice
                await dbAdapter.sizePriceAdapter.update(existingSizePrice[0].id, { price: sp.price });
            } else {
                // Create new sizePrice if it doesn't exist
                await dbAdapter.sizePriceAdapter.create({
                    size: sp.sizeId,
                    price: sp.price,
                    period: period.id
                });
            }
        }
    }

    return { ...period, name, sizePrices };
};


const remove = async (id) => {
    const period = await dbAdapter.periodAdapter.getById(id);
    if (!period) {
        throw new Error('Period not found');
    }

    // Soft delete the Period
    await dbAdapter.periodAdapter.update(id, { deletedAt: new Date() });

    return { message: 'Period deleted successfully' };
};

module.exports = {
    getByIdAndCompany,
    getAllByCompany,
    create,
    update,
    remove
};
