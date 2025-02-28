const { Schema, model } = require('mongoose');

const CompanySchema = Schema({

  name: {
    type: String,
    required: true
  },
},
  { timestamps: true },
);


CompanySchema.method('toJSON', function () {
  const { __v, _id, createdAt, updatedAt, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = model('Company', CompanySchema);