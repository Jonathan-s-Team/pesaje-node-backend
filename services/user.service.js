const bcrypt = require('bcryptjs');

const dbAdapter = require('../adapters');

const create = async (data) => {
    if (!data.person) {
        throw new Error('Person data is required');
    }

    // Check if the username already exists
    const existingUser = await dbAdapter.userAdapter.getAll({ username: data.username });
    if (existingUser.length > 0) {
        throw new Error('Username is already taken');
    }

    // Create the Person entry
    const person = await dbAdapter.personAdapter.create(data.person);

    // Hash the password
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(data.password, salt);

    // Create User
    return await dbAdapter.userAdapter.create({
        username: data.username,
        password: hashedPassword,
        roles: data.roles,
        person: person.id // Use `.id` for cross-DB compatibility
    });
};

const getAll = async (includeDeleted = false) => {
    const query = includeDeleted ? {} : { deletedAt: null };

    let users;

    // Ensure population works for MongoDB (not needed in relational DBs)
    if (process.env.DB_TYPE === 'mongo') {
        users = await dbAdapter.userAdapter.getAllWithRelations(query, ['person', 'roles']);
    } else {
        // Fetch all users from the adapter (for relational databases)
        users = await dbAdapter.userAdapter.getAll(query);
    }

    // Exclude password field from all users
    return users.map(({ password, ...user }) => user);
};

const getById = async (id) => {
    let user = await dbAdapter.userAdapter.getById(id);

    if (!user) {
        throw new Error('User not found');
    }

    // Ensure population for MongoDB (skip for SQL databases)
    if (process.env.DB_TYPE === 'mongo') {
        user = await dbAdapter.userAdapter.getByIdWithRelations(id, ['person', 'roles']);
    }

    // Exclude password field
    const { password, ...safeUser } = user;
    return safeUser;
};


const update = async (id, data) => {
    let user = await dbAdapter.userAdapter.getById(id);
    if (!user) {
        throw new Error('User not found');
    }

    // Update Person details if present
    if (data.person) {
        await dbAdapter.personAdapter.update(user.person, data.person);
        delete data.person; // Prevent full person object update in user model
    }

    // Update user record
    return await dbAdapter.userAdapter.update(id, data);
};

const remove = async (id) => {
    let user = await dbAdapter.userAdapter.getById(id);
    if (!user) {
        throw new Error('User not found');
    }

    // Soft delete user
    return await dbAdapter.userAdapter.update(id, { deletedAt: new Date() });
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    remove,
};