const { Schema, model } = require('mongoose');

const BrokerSchema = Schema({

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

module.exports = model('Broker', BrokerSchema);