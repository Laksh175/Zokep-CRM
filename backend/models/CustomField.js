import mongoose from 'mongoose';

const customFieldSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fieldLabel: {
      type: String,
      required: [true, 'Please provide a field label'],
      trim: true,
    },
    fieldName: {
      type: String,
      required: true,
      trim: true,
    },
    fieldType: {
      type: String,
      enum: ['text', 'number', 'select', 'radio', 'checkbox', 'date', 'textarea'],
      default: 'text',
    },
    options: [
      {
        type: String,
        trim: true,
      },
    ],
    placeholder: {
      type: String,
      default: '',
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    showInTable: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto slugify fieldName if not provided
customFieldSchema.pre('validate', function (next) {
  if (this.fieldLabel && !this.fieldName) {
    this.fieldName = this.fieldLabel
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 30);
  }
  next();
});

const CustomField = mongoose.model('CustomField', customFieldSchema);
export default CustomField;
