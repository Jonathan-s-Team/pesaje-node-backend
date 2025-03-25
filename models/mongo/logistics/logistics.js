const { Schema, model } = require('mongoose');

const LogisticsSchema = Schema({
  purchase: {
    type: Schema.Types.ObjectId,
    ref: 'Purchase',
    required: true
  },
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'LogisticsItem',
    required: true
  }],
  logisticsDate: {
    type: Date,
    required: true,
  },
  grandTotal: {
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

LogisticsSchema.method('toJSON', function () {
  const { __v, _id, createdAt, updatedAt, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = model('Logistics', LogisticsSchema);