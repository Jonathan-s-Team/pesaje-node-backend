const { Schema, model } = require('mongoose');

const ClientSchema = Schema({

  person: {
    type: Schema.Types.ObjectId,
    ref: 'Person',
    required: true
  },
  buyersItBelongs: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
});

ClientSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = model('Client', ClientSchema);