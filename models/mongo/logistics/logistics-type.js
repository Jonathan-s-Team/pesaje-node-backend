const { Schema, model } = require('mongoose');

const LogisticsTypeEnum = require('../../../enums/logistics-types.enum');

const LogisticsTypeSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: LogisticsTypeEnum,
    required: true,
  },
  deletedAt: {
    type: Date,
    default: null
  }
},
  { timestamps: true },
);


LogisticsTypeSchema.method('toJSON', function () {
  const { __v, _id, createdAt, updatedAt, ...object } = this.toObject();
  object.id = _id;
  return object;
});


module.exports = model('LogisticsType', LogisticsTypeSchema);