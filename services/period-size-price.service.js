const dbAdapter = require('../adapters');

const getByNameAndCompany = async (name, companyId) => {
    if (!name || !companyId) {
        throw new Error('Both name and companyId are required');
    }

    // Find the period by name and company
    const periods = await dbAdapter.periodAdapter.getAllWithRelations(
        { name, company: companyId, deletedAt: null },
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

const create = async (data) => {
    const existingPeriod = await dbAdapter.periodAdapter.getAll({
        name: data.name,
        company: data.company
    });

    if (existingPeriod.length > 0) {
        throw new Error(`A period with the name "${data.name}" already exists for this company.`);
    }

    // Validate company exists
    const companyExists = await dbAdapter.companyAdapter.getById(data.company);
    if (!companyExists) {
        throw new Error('Company does not exist');
    }

    // Validate sizePrices is an array
    if (data.sizePrices && !Array.isArray(data.sizePrices)) {
        throw new Error('sizePrices must be an array');
    }

    // Extract size IDs from the request
    const sizeIds = data.sizePrices ? data.sizePrices.map(sp => sp.id) : [];

    // Validate all sizes exist
    if (sizeIds.length > 0) {
        const existingSizes = await dbAdapter.sizeAdapter.getAll({ _id: { $in: sizeIds } });

        // Ensure all sizes exist
        if (existingSizes.length !== sizeIds.length) {
            throw new Error('One or more sizes do not exist');
        }
    }

    // Create the Period
    const period = await dbAdapter.periodAdapter.create({
        name: data.name,
        company: data.company
    });

    // Create SizePrice records
    let sizePrices = [];
    if (data.sizePrices) {
        sizePrices = await Promise.all(
            data.sizePrices.map(async (sp) => {
                return dbAdapter.sizePriceAdapter.create({
                    size: sp.id,
                    price: sp.price,
                    period: period.id
                });
            })
        );
    }

    return { ...period, sizePrices };
};


const update = async (id, data) => {
    const period = await dbAdapter.periodAdapter.getById(id);
    if (!period) {
        throw new Error('Period not found');
    }

    // Update Period
    const updatedPeriod = await dbAdapter.periodAdapter.update(id, data);

    // If sizePrices are provided, update them
    let updatedSizePrices = [];
    if (data.sizePrices && Array.isArray(data.sizePrices)) {
        await Promise.all(
            data.sizePrices.map(async (sp) => {
                if (sp.id) {
                    // Update existing SizePrice record
                    const existingSizePrice = await dbAdapter.sizePriceAdapter.getById(sp.id);
                    if (existingSizePrice) {
                        await dbAdapter.sizePriceAdapter.update(sp.id, {
                            size: sp.size,
                            price: sp.price
                        });
                    }
                } else {
                    // Create new SizePrice record
                    updatedSizePrices.push(
                        await dbAdapter.sizePriceAdapter.create({
                            size: sp.size,
                            price: sp.price,
                            period: id
                        })
                    );
                }
            })
        );
    }

    return { ...updatedPeriod, updatedSizePrices };
};

const remove = async (id) => {
    const period = await dbAdapter.periodAdapter.getById(id);
    if (!period) {
        throw new Error('Period not found');
    }

    // Soft delete the Period
    await dbAdapter.periodAdapter.update(id, { deletedAt: new Date() });

    // Soft delete related SizePrice records
    await dbAdapter.sizePriceAdapter.updateMany({ period: id }, { deletedAt: new Date() });

    return { message: 'Period and associated SizePrices deleted successfully' };
};

module.exports = {
    getByNameAndCompany,
    create,
    update,
    remove
};
