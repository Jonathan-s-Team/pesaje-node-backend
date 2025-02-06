const { Schema, model } = require('mongoose');

const UserSchema = Schema({
    person: {
        type: Schema.Types.ObjectId,
        ref: 'Person',
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    roles: [{
        type: Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    }],
    // For users with the role "Comprador"
    brokers: [{
        type: Schema.Types.ObjectId,
        ref: 'Broker'
    }],
    deletedAt: {
        type: Date,
        default: null
    }
});

UserSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

module.exports = model('User', UserSchema);