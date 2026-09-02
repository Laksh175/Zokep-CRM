import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a plan name'],
      trim: true,
    },
    durationMonths: {
      type: Number,
      required: [true, 'Please provide plan duration in months'],
      default: 1,
      min: 1,
    },
    billingCycle: {
      type: String,
      default: 'monthly',
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    leadLimit: {
      type: Number,
      default: -1, // -1 means unlimited
    },
    staffLimit: {
      type: Number,
      default: -1, // -1 means unlimited
    },
    razorpayPlanId: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Plan = mongoose.model('Plan', planSchema);
export default Plan;

