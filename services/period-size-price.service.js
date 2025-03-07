const dbAdapter = require('../adapters');

const getById = async (id) => {
    // Find the period by id
    const period = await dbAdapter.periodAdapter.getById(id);

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
            { name: data.name, receivedDateTime: data.receivedDateTime, company: data.company },
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
    const { receivedDateTime, sizePrices } = data;

    // Find the period
    const period = await dbAdapter.periodAdapter.getById(periodId);
    if (!period) {
        throw new Error('Period not found');
    }

    // Validate receivedDateTime format (if provided)
    if (receivedDateTime && isNaN(Date.parse(receivedDateTime))) {
        throw new Error('Invalid receivedDateTime format. Use ISO 8601 format.');
    }

    // Validate that sizePrices is provided and not empty
    if (!sizePrices || sizePrices.length === 0) {
        throw new Error('sizePrices must be provided and cannot be empty.');
    }

    // Validate that all `sizeId`s exist
    const sizeIds = sizePrices.map(sp => sp.sizeId);
    const existingSizes = await dbAdapter.sizeAdapter.getAll({ _id: { $in: sizeIds } });

    if (existingSizes.length !== sizeIds.length) {
        throw new Error('One or more sizeIds provided do not exist. No updates were performed.');
    }

    // Start transaction using the dbAdapter method
    const transaction = await dbAdapter.periodAdapter.startTransaction();

    try {
        if (receivedDateTime) {
            await dbAdapter.periodAdapter.update(periodId, { receivedDateTime }, { session: transaction.session });
        }

        for (let sp of sizePrices) {
            const existingSizePrice = await dbAdapter.sizePriceAdapter.getAll({
                size: sp.sizeId,
                period: period.id
            });

            if (existingSizePrice.length > 0) {
                // Update existing sizePrice
                await dbAdapter.sizePriceAdapter.update(existingSizePrice[0].id, { price: sp.price }, { session: transaction.session });
            } else {
                // Create new sizePrice if it doesn't exist
                await dbAdapter.sizePriceAdapter.create({
                    size: sp.sizeId,
                    price: sp.price,
                    period: period.id
                }, { session: transaction.session });
            }
        }

        // Commit transaction if everything succeeds
        await transaction.commit();
        transaction.end();

        return { ...period, receivedDateTime, sizePrices };
    } catch (error) {
        await transaction.rollback();
        await transaction.end();
        throw new Error(`Update failed: ${error.message}`);
    }
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
    getById,
    getAllByCompany,
    create,
    update,
    remove
};
