const { Schema, model } = require('mongoose');

const ClientSchema = Schema({

  person: {
    type: Schema.Types.ObjectId,
    ref: 'Person',
    required: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
});

module.exports = model('Client', ClientSchema);