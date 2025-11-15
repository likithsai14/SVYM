const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  aboutus: {
    mission: { type: String, required: true, trim: true },
    vision: { type: String, required: true, trim: true },
    values: [{ type: String, required: true, trim: true }]  // changed to array
  },

  contactus: {
    emails: [{ type: String, trim: true, lowercase: true }],
    phones: [{ type: String, trim: true }],
    addresses: [{ type: String, trim: true }],

    socialMedia: {
      type: Map,
      of: String,
      default: {}
      // Example saved:
      // { facebook: "...", linkedin: "...", instagram: "..." }
    }
  },

  help: [{
    qtn: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: "general" }
  }]
}, {
  timestamps: true
});

// Force single-organization document
organizationSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({ _id: "ORGANIZATION_SINGLETON" });
  }
  return doc;
};

module.exports = mongoose.model('Organization', organizationSchema);
