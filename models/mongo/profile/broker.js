const { Schema, model } = require('mongoose');

const BrokerSchema = Schema({

  person: {
    type: Schema.Types.ObjectId,
    ref: 'Person',
    required: true
  },
  buyerItBelongs: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
});

BrokerSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = model('Broker', BrokerSchema);