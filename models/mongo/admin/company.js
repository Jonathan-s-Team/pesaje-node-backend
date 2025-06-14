const { Schema, model } = require('mongoose');

const CompanySchema = Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    unique: true,
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  mainTelephone: {
    type: String,
    required: true
  },
  invoiceEmail: {
    type: String,
  },

  mainPersonName: {
    type: String,
    required: true
  },
  managerName: {
    type: String,
  },
  managerCellPhone: {
    type: String,
  },
  managerEmail: {
    type: String,
  },
  commercialAdvisorName: {
    type: String,
  },
  commercialAdvisorCellPhone: {
    type: String,
  },
  commercialAdvisorEmail: {
    type: String,
  },
  aditionalStaffName: {
    type: String,
  },
  positionInCompany: {
    type: String,
  },
  aditionalStaffCellPhone: {
    type: String,
  },
  aditionalStaffEmail: {
    type: String,
  },

  priceListByEmail: {
    type: Boolean,
  },
  priceListByMessagesOrWhatsApp: {
    type: Boolean,
  },
  receivesWholeShrimp: {
    type: Boolean,
  },
  receivesShrimpTails: {
    type: Boolean,
  },
  maxFlavorPercentReceived: {
    type: Number, // e.g., 15 for 15%
  },
  maxMoultingAndSoftnessPercentReceived: {
    type: Number,
  },
  avgWholeShrimpPackagingWeight: {
    type: Number, // specify unit if needed
  },
  avgShrimpTailPackagingWeight: {
    type: Number,
  },
  maxLightFlavorPercentAllowedInWholeShrimp: {
    type: Number,
  },
  maxAndMinTideQuotaReceived: {
    max: {
      type: Number,
    },
    min: {
      type: Number,
    }
  },

  paymentMethod1: {
    type: String, // e.g., "transfer", "cash", "credit"
  },
  paymentMethod2: {
    type: String,
  },
  bank1: {
    type: String, // e.g., "Bank of America"
  },
  bank2: {
    type: String,
  },
  firstPaymentPercent: {
    type: Number, // e.g., 30 for 30%
  },
  daysUntilFirstPayment: {
    type: Number, // e.g., 7 days
  },
  secondPaymentPercent: {
    type: Number,
  },
  daysUntilSecondPayment: {
    type: Number,
  },
  thirdPaymentPercent: {
    type: Number,
  },
  daysUntilThirdPayment: {
    type: Number,
  },
  paymentReliabilityPercent: {
    type: Number, // e.g., 90 for 90% reliable
  },

  logisticsShippingAvailable: {
    type: Boolean, // true = yes, false = no
  },
  logisticsCompensationWhole: {
    type: Number, // amount in $
  },
  logisticsCompensationTails: {
    type: Number, // amount in $
  },
  minimumQuantityReceivedLb: {
    type: Number, // in pounds (LB)
  },
  custodyCovered: {
    type: Boolean,
  },
  fishingInsuranceCovered: {
    type: Boolean, // for accidents and fishing
  },
  companyClassifierKnown: {
    type: Boolean,
  },
  personCanBeSentForClassification: {
    type: Boolean,
  },
  extraInformation: {
    type: String,
  },

  classificationQuality: {
    type: String, // e.g., "BAD", "GOOD", "EXCELLENT"
    enum: ['BAD', 'GOOD', 'EXCELLENT'],
  },
  arePaymentsOnTime: {
    type: Boolean, // true = yes, false = no
  },
  observation1: {
    type: String,
  },
  observation2: {
    type: String,
  },
  observation3: {
    type: String,
  },
  observation4: {
    type: String,
  },
  isLogisticsSent: {
    type: Boolean,
  },
  isLogisticsPayed: {
    type: Boolean,
  },
  wholeAmountToPay: {
    type: Number,
  },
  tailAmountToPay: {
    type: Number,
  },

  deletedAt: {
    type: Date,
    default: null
  }
},
  { timestamps: true },
);

// 🔹 Auto-increment `code`
CompanySchema.pre('save', async function (next) {
  if (!this.code) {
    try {
      const Counter = require('../control/counter'); // Lazy import
      const counterKey = 'Company-Code';

      const counter = await Counter.findOneAndUpdate(
        { model: counterKey },
        { $inc: { seq: 100 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      // If this is the first time, set seq to 101 instead of 100
      if (counter.seq === 100) {
        counter.seq = 101;
        await counter.save();
      }

      if (!counter) {
        return next(new Error('Failed to generate company code.'));
      }

      this.code = `${counter.seq}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

CompanySchema.method('toJSON', function () {
  const { __v, _id, createdAt, updatedAt, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = model('Company', CompanySchema);