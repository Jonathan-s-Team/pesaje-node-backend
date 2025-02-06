const { Schema, model } = require('mongoose');

const RoleSchema = Schema({

    name: {
        type: String,
        required: true,
        unique: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
});

module.exports = model('Role', RoleSchema);