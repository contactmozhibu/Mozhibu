const mongoose = require("mongoose");

const SubscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    priceInPaise: { type: Number, required: true }, // e.g., 9900 = ₹99.00
    currency: { type: String, default: "INR" },
    durationDays: { type: Number, required: true },
    marketingBenefits: [{ type: String }],
    structuredBenefits: {
      unlimited_premium_access: { type: Boolean, default: false },
      ad_free: { type: Boolean, default: false },
      early_access_days: { type: Number, default: 0 },
      multi_language_access: { type: Boolean, default: false },
      priority_support: { type: Boolean, default: false },
    },
    terms: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
