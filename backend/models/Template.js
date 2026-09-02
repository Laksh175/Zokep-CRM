import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['whatsapp', 'email'],
      required: true,
      default: 'whatsapp',
    },
    title: {
      type: String,
      required: [true, 'Please provide a template title'],
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    body: {
      type: String,
      required: [true, 'Please provide template content'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Template = mongoose.model('Template', templateSchema);
export default Template;
