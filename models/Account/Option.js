const { Schema, model } = require('mongoose');

const OptionSchema = Schema({

    name: {
        type: String,
        required: true
    },
    route: {
        type: String,
    },
    suboptions: [{
        type: Schema.Types.ObjectId,
        ref: 'Option'
    }],
});

OptionSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

module.exports = model('Option', OptionSchema);