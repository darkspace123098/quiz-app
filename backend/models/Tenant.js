import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  ownerEmail: { type: String, required: true, unique: true },
  subscriptionStatus: { 
    type: String, 
    enum: ["active", "past_due", "canceled", "incomplete"], 
    default: "active" 
  },
  planType: { 
    type: String, 
    enum: ["starter", "professional", "enterprise"], 
    default: "starter" 
  },
  stripeCustomerId: { type: String },
  settings: {
    logo: { type: String },
    primaryColor: { type: String, default: "#9333ea" },
  }
}, { timestamps: true });

export default mongoose.model("Tenant", tenantSchema);
