const { Schema, model } = require('mongoose');

const CompanySaleSchema = Schema({
  sale: {
    type: Schema.Types.ObjectId,
    ref: 'Sale',
    required: true
  },
  document: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  np: {
    type: String,
    required: true
  },
  serialNumber: {
    type: Number,
    required: true
  },
  receptionDateTime: {
    type: Date,
    required: true,
  },
  settleDateTime: {
    type: Date,
    required: true,
  },
  batchAverageGram: {
    type: Number,
    required: true,
  },
  wholeReceivedPounds: {
    type: Number,
    required: true,
  },
  trashPounds: {
    type: Number,
    required: true,
  },
  netReceivedPounds: {
    type: Number,
    required: true,
  },
  processedPounds: {
    type: Number,
    required: true,
  },
  performance: {
    type: Number,
    required: true,
  },
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'CompanySaleItemSchema',
    required: true
  }],
  poundsGrandTotal: {
    type: Number,
    required: true,
    min: 0
  },
  grandTotal: {
    type: Number,
    required: true,
    min: 0
  },
  percentageTotal: {
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

CompanySaleSchema.method('toJSON', function () {
  const { __v, _id, createdAt, updatedAt, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = model('CompanySale', CompanySaleSchema);