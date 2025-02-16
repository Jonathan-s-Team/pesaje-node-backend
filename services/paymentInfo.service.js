
const { PaymentInfo, Person } = require('../models');


const create = async (data) => {
    const { personId, ...paymentData } = data;

    // Validate that `personId` is provided
    if (!personId) {
        throw new Error('Person ID is required');
    }

    // Check if the `Person` exists in the database
    const person = await Person.findById(personId);
    if (!person) {
        throw new Error('Person not found');
    }

    // Attach `person` to the payment info data
    const paymentInfoData = {
        ...paymentData,
        person: personId
    };

    return await PaymentInfo.create(paymentInfoData);
};


const getAll = async (personId) => {
    let query = {}; // Default: fetch all payment info

    if (personId) {
        // Check if the person exists in the database
        const person = await Person.findById(personId);
        if (!person) {
            throw new Error('Person not found');
        }
        query = { person: personId }; // Filter by personId
    }

    return await PaymentInfo.find(query);
};



const getById = async (id) => {
    return await PaymentInfo.findById(id);
};

const update = async (id, data) => {
    delete data.personId; // Ensure `personId` is not updated

    const updatedPaymentInfo = await PaymentInfo.findByIdAndUpdate(id, data, { new: true });

    if (!updatedPaymentInfo) {
        throw new Error('Payment info not found');
    }

    return updatedPaymentInfo;
};


const remove = async (id) => {
    const paymentInfo = await PaymentInfo.findById(id);

    if (!paymentInfo) {
        const error = new Error('PaymentInfo not found');
        error.status = 404;
        throw error;
    }

    return await PaymentInfo.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
};


module.exports = {
    create,
    getAll,
    getById,
    update,
    remove,
};