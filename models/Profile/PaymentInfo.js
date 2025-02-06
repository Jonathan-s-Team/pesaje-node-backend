const { Schema, model } = require('mongoose');

const PaymentInfoSchema = Schema({
    bankName: {
        type: String,
        required: true
    },
    accountName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    identification: {
        type: String,
        required: true
    },
    mobilePhone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

module.exports = model('PaymentInfo', PaymentInfoSchema);