const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, select: false }, // Optional for oauth, but required for 'normal'
    preferredLanguage: { type: String, required: true },
    favoriteGenres: { type: [String], required: true },
    penName: { type: String, unique: true, sparse: true, trim: true },
    legalName: { type: String, trim: true, default: "" },
    isOnboarded: { type: Boolean, default: false },
    authProvider: {
      type: String,
      enum: ["normal", "google", "facebook"],
      default: "normal",
    },
    role: {
      type: String,
      enum: ["reader", "writer", "superadmin"],
      default: "reader",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "deactivated"],
      default: "active",
    },
    suspendedUntil: {
      type: Date,
      default: null,
    },
    authorStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    followersCount: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    avatar: { type: String },
    bio: { type: String, default: "" },
    savedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    favoriteBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dismissedAnnouncements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Broadcast" }],
    dob: { type: Date },
    monetization: {
      accountName: { type: String, default: "" }, // Will store encrypted string
      bankName: { type: String, default: "" },    // Will store encrypted string
      accountNumber: { type: String, default: "" },// Will store encrypted string
      ifscCode: { type: String, default: "" }     // Will store encrypted string
    },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
  },
  {
    timestamps: true,
  },
);

// Performance Indexes
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", UserSchema);
