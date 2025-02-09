// services/loginService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { User, RolePermission, Option } = require('../models/Account');


const loginUser = async (username, password) => {

    const user = await User.findOne({ username }).populate('roles');

    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Verify the password 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    // Generate JWT token. Use your secret from an env variable in production.
    const payload = { id: user._id, name: user.username, email: user.person.email };
    const token = jwt.sign(payload, process.env.SECRET_JWT_SEED || 'secretKey', { expiresIn: '1h' });

    const rolePermissions = await RolePermission.find({ role: { $in: user.roles.map(role => role._id) } });

    const optionsMap = {};

    rolePermissions.forEach((rolePerm) => {
        const optionId = rolePerm.option.toString();
        // If this option hasn't been added to the map, initialize it.
        if (!optionsMap[optionId]) {
            optionsMap[optionId] = new Set();
        }
        // Add all actions from this rolePermission.
        rolePerm.actions.forEach(action => optionsMap[optionId].add(action));
    });

    const optionsData = await Option.find({ _id: { $in: Object.keys(optionsMap) } });

    const optionsArray = optionsData.map(opt => {
        return {
            _id: opt._id,
            name: opt.name,
            parentOption: opt.parentOption,
        }
    });

    optionsArray.forEach(opt => {
        opt.actions = optionsMap[opt._id.toString()]
            ? Array.from(optionsMap[opt._id.toString()])
            : [];
    });

    // Create a lookup map with each option keyed by its _id as a string.
    const lookup = {};

    // First pass: clone each option and add a suboptions property.
    optionsArray.forEach(option => {
        // Make sure to clone and add an empty suboptions array.
        lookup[option._id.toString()] = { ...option, suboptions: [] };
    });

    // Array to hold the top-level options.
    const nestedOptions = [];

    // Second pass: nest each option based on its parentOption.
    optionsArray.forEach(option => {
        const id = option._id.toString();
        if (option.parentOption) {
            const parentId = option.parentOption.toString();
            // If the parent exists in our lookup, add this option to its suboptions.
            if (lookup[parentId]) {
                lookup[parentId].suboptions.push(lookup[id]);
            } else {
                // If the parent isn't found, treat this option as a top-level option.
                nestedOptions.push(lookup[id]);
            }
        } else {
            // No parentOption means it's a top-level option.
            nestedOptions.push(lookup[id]);
        }
    });

    // console.log(JSON.stringify(nestedOptions, null, 2));

    return {
        token,
        user: { id: user._id, name: user.username },
        permissions: nestedOptions
    };
};

module.exports = { loginUser };