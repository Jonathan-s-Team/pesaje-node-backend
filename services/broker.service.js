const { Broker, User, Person } = require('../models');

const getAllByUserId = async (userId) => {
    let brokersArray = [];

    const brokers = await Broker.find({ buyerItBelongs: userId }).populate('person');
    brokers.forEach(broker => {
        const { person, ...brokerObject } = broker.toJSON();
        brokerObject.person = broker.person;
        brokersArray.push(brokerObject);
    });

    return brokersArray;
};

const getById = async (id) => {
    const broker = await Broker.findById(id).populate('person');

    const { person, ...brokerObject } = broker.toJSON();
    brokerObject.person = broker.person;

    return brokerObject;
};

const create = async (data) => {
    // Ensure the buyer exists in the database
    const userExists = await User.findById(data.buyerItBelongs);
    if (!userExists) {
        throw new Error('Buyer (buyerItBelongs) does not exist');
    }

    if (!data.person || typeof data.person !== 'object') {
        throw new Error('Person data is required and must be an object');
    }

    // Create the Person document first
    const person = new Person(data.person);
    const savedPerson = await person.save();

    // Now create the Broker referencing the created Person
    const broker = new Broker({
        person: savedPerson._id, // Reference the newly created Person
        buyerItBelongs: data.buyerItBelongs
    });

    return await broker.save();
};

const update = async (id, data) => {
    const broker = await Broker.findById(id);
    if (!broker) {
        throw new Error('Broker not found');
    }

    // If person data is included, update the referenced Person document
    if (data.person) {
        await Person.findByIdAndUpdate(broker.person, data.person, { new: true, runValidators: true });
    }

    // Remove buyerItBelongs from the update data to prevent it from being modified
    const updateData = { ...data };
    delete updateData.buyerItBelongs;
    delete updateData.person;

    const updatedBroker = await Broker.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('person');

    const { person, ...brokerObject } = updatedBroker.toJSON();
    brokerObject.person = updatedBroker.person;

    return brokerObject;
};


const remove = async (id) => {
    const broker = await Broker.findById(id);

    if (!broker) {
        const error = new Error('Broker not found');
        error.status = 404;
        throw error;
    }

    return await Broker.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
};

module.exports = {
    getAllByUserId,
    getById,
    create,
    update,
    remove
};
