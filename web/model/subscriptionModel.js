import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  shop: { type: String, required: true, unique: true },
  subscriptionId: { type: String },
  planName: { type: String },
  status: { type: String, default: "PENDING" }, // ACTIVE, CANCELLED, PENDING
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  is_install: { type: Boolean, default: false },
  blogCount: { type: Number, default: 0 },
  lastReset: { type: Date },
  // planType: { type: String},
});

export default mongoose.model("Subscription", subscriptionSchema);
