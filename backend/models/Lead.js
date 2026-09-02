import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Fixed Base Fields
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Lead contact phone is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    dealValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    source: {
      type: String,
      enum: ['manual', 'public_form', 'csv_import', 'staff_added', 'website', 'referral', 'social_media', 'other'],
      default: 'manual',
    },
    notes: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Multi-tenant Assignment & Pipeline Status
    statusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeadStatus',
      default: null,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    // Dynamic custom fields defined by Admin in Settings
    customFieldsData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Conversion to Customer
    isConverted: {
      type: Boolean,
      default: false,
      index: true,
    },
    convertedAt: {
      type: Date,
      default: null,
    },
    convertedDealAmount: {
      type: Number,
      default: 0,
    },

    // Activity tracking
    nextFollowupDate: {
      type: Date,
      default: null,
    },
    lastContactedAt: {
      type: Date,
      default: null,
    },
    lastFollowupNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
