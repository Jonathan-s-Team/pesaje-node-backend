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

RoleSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

module.exports = model('Role', RoleSchema);