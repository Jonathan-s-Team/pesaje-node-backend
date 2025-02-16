const bcrypt = require('bcryptjs');

const { User, Role, Person } = require('../models');


const create = async (data) => {
    if (!data.person) {
        throw new Error('Person data is required');
    }

    // Check if the username already exists
    const existingUser = await User.findOne({ username: data.username });
    if (existingUser) {
        throw new Error('Username is already taken');
    }

    // Create the Person only if the username is unique
    const person = await Person.create(data.person);

    const salt = bcrypt.genSaltSync();

    const user = await User.create({
        username: data.username,
        password: bcrypt.hashSync(data.password, salt),
        roles: data.roles,
        person: person._id
    });
};

const getAll = async (includeDeleted = false) => {
    const query = includeDeleted ? {} : { deletedAt: null };
    let usersArray = [];
    const users = await User.find(query)
        .populate('person')
        .populate('roles');
    users.forEach(user => {
        const { person, roles, ...userObject } = user.toJSON();
        userObject.person = user.person;
        userObject.roles = user.roles;
        usersArray.push(userObject);
    });

    return usersArray;
};

const getById = async (id) => {
    const user = await User.findById(id)
        .populate('person')
        .populate('roles');

    const { person, roles, ...userObject } = user.toJSON();
    userObject.person = user.person;
    userObject.roles = user.roles;

    return userObject;
};

const update = async (id, data) => {
    let user = await User.findById(id);
    if (!user) {
        throw new Error('User not found');
    }

    // If `person` field is present in `data`, update the `Person` separately
    if (data.person) {
        await Person.findByIdAndUpdate(user.person, data.person, { new: true });
        delete data.person; // Prevent sending full person object to User update
    }

    // Update User without sending full person object
    const updatedUser = await User.findByIdAndUpdate(id, data, { new: true })
        .populate('person')
        .populate('roles');

    const { person, roles, ...userObject } = updatedUser.toJSON();
    userObject.person = updatedUser.person;
    userObject.roles = updatedUser.roles;

    return userObject;
};

const remove = async (id) => {
    const user = await User.findById(id);

    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    return await User.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    remove,
};