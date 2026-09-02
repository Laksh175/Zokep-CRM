import mongoose from 'mongoose';

const leadStatusSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a status name'],
      trim: true,
    },
    color: {
      type: String,
      default: '#3b82f6', // Hex code
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isConvertedState: {
      type: Boolean,
      default: false,
    },
    isLostState: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const LeadStatus = mongoose.model('LeadStatus', leadStatusSchema);
export default LeadStatus;
