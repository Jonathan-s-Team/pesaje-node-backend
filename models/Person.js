const { Schema, model } = require('mongoose');

const PersonSchema = new Schema({
    photo: {
        type: String  // e.g., URL or file path; optional
    },
    names: {
        type: String,
        required: true
    },
    lastNames: {
        type: String,
        required: true
    },
    identification: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String  // optional landline or similar
    },
    mobilePhone: {
        type: String,
        required: true
    },
    mobilePhone2: {
        type: String  // optional
    },
    email: {
        type: String,
        required: true
    },
    emergencyContactName: {
        type: String,
        required: true
    },
    emergencyContactPhone: {
        type: String,
        required: true
    },
    paymentInfos: [{
        type: Schema.Types.ObjectId,
        ref: 'PaymentInfo'
    }],
    // Soft delete field: when not deleted, deletedAt is null.
    deletedAt: {
        type: Date,
        default: null
    }
});

module.exports = model('Person', PersonSchema);