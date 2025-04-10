const { Schema, model } = require('mongoose');

const LogisticsTypeEnum = require('../../../enums/logistics-type.enum');


const LogisticsSchema = Schema({
  purchase: {
    type: Schema.Types.ObjectId,
    ref: 'Purchase',
    required: true
  },
  logisticsDate: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: LogisticsTypeEnum,
    required: true,
  },
  grandTotal: {
    type: Number,
    required: true,
    min: 0
  },
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'LogisticsItem',
    required: true
  }],
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