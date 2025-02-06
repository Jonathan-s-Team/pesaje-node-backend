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

    const aggregatedOptions = Object.keys(optionsMap).map(optionId => ({
        option: optionId, // this is still the id; we will populate it next
        actions: Array.from(optionsMap[optionId])
    }));

    const optionIds = aggregatedOptions.map(item => item.option);
    const optionsData = await Option.find({ _id: { $in: optionIds } });

    const optionLookup = {};
    optionsData.forEach(opt => {
        optionLookup[opt._id.toString()] = opt.toObject(); // convert to plain object
    });

    const aggregatedWithDetails = aggregatedOptions.map(item => ({
        option: optionLookup[item.option],
        actions: item.actions,
        // We'll use these properties to help with nesting.
        nestedSuboptions: [],
        isNested: false // flag to mark if this aggregated option is already nested under a parent
    }));

    const aggregatedMap = {};
    aggregatedWithDetails.forEach(item => {
        aggregatedMap[item.option._id.toString()] = item;
    });

    Object.values(aggregatedMap).forEach(parentItem => {
        if (parentItem.option.suboptions && parentItem.option.suboptions.length > 0) {
            parentItem.option.suboptions.forEach(childId => {
                const childIdStr = childId.toString();
                const childAggregated = aggregatedMap[childIdStr];
                if (childAggregated) {
                    // Nest the child under this parent.
                    parentItem.nestedSuboptions.push(childAggregated);
                    // Mark the child as nested so it won't appear as a top-level option.
                    childAggregated.isNested = true;
                }
            });
        }
    });

    const availableOptions = Object.values(aggregatedMap).filter(item => !item.isNested);


    return {
        token,
        user: { id: user._id, name: user.username },
        availableOptions
    };
};

module.exports = { loginUser };