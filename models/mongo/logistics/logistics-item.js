const { Schema, model } = require('mongoose');

const LogisticsItemSchema = Schema({
  logisticsType: {
    type: Schema.Types.ObjectId,
    ref: 'LogisticsType',
    required: true
  },
  unit: {
    type: Number,
    required: true,
    min: 0,
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  deletedAt: {
    type: Date,
    default: null
  }
},
  { timestamps: true },
);


LogisticsItemSchema.method('toJSON', function () {
  const { __v, _id, createdAt, updatedAt, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = model('LogisticsItem', LogisticsItemSchema);