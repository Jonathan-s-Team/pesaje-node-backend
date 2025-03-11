const { Schema, model } = require('mongoose');

const PurchaseStatusEnum = require('../../../enums/purchase-status.enum');


const PurchaseSchema = Schema({
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  broker: {
    type: Schema.Types.ObjectId,
    ref: 'Broker',
    required: true
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  shrimpFarm: {
    type: Schema.Types.ObjectId,
    ref: 'ShrimpFarm',
    required: true
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  averageGrams: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  pounds: {
    type: Number,
    required: true,
    min: 0
  },
  averageGrams2: {
    type: Number,
    min: 0
  },
  price2: {
    type: Number,
    min: 0
  },
  pounds2: {
    type: Number,
    min: 0
  },
  totalPounds: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal2: {
    type: Number,
    min: 0
  },
  grandTotal: {
    type: Number,
    required: true,
    min: 0
  },
  totalAgreedToPay: {
    type: Number,
    required: true,
    min: 0
  },
  hasInvoice: {
    type: Boolean,
    required: true,
  },
  invoice: {
    type: String,
    sparse: true // Allows multiple `null` values while keeping uniqueness for non-null values
  },
  status: {
    type: String,
    enum: PurchaseStatusEnum,
    required: true,
  },
  deletedAt: {
    type: Date,
    default: null
  }
},
  { timestamps: true },
);


// 🔹 Unique index for invoice per client (only when invoice is not null)
PurchaseSchema.index(
  { client: 1, invoice: 1 },
  {
    unique: true,
    partialFilterExpression: { invoice: { $exists: true } }
  }
);

PurchaseSchema.method('toJSON', function () {
  const { __v, _id, createdAt, updatedAt, ...object } = this.toObject();
  object.id = _id;
  return object;
});

// 🔹 Ensure indexes are properly synchronized during schema initialization
PurchaseSchema.on('index', (error) => {
  if (error) console.error('❌ Indexing error:', error);
});

module.exports = model('Purchase', PurchaseSchema);