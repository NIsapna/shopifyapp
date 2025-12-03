import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  id: String,
  name: String,
  status: String,
  currentPeriodEnd: String,
  planName: String,
  price: Number,
  currency: String
});

const ShopSchema = new mongoose.Schema({
  shopifySessionId: { type: String, unique: true }, // Reference to Shopify session
  shop: { type: String },
  state: { type: String },
  isOnline: { type: Boolean },
  scope: { type: String },
  accessToken: { type: String },
  storefrontToken: { type: String },
  status: { type: String, default: "1" },
  subscription: subscriptionSchema,
}, { timestamps: true });

export default mongoose.model('Shop', ShopSchema);
