import express from 'express';
import {
  getLeadStatuses,
  createLeadStatus,
  updateLeadStatus,
  deleteLeadStatus,
  getCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  sendLeadEmailWithTemplate,
} from '../controllers/settingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// Statuses
router.get('/statuses', authorize('admin', 'staff'), getLeadStatuses);
router.post('/statuses', authorize('admin'), createLeadStatus);
router.put('/statuses/:id', authorize('admin'), updateLeadStatus);
router.delete('/statuses/:id', authorize('admin'), deleteLeadStatus);

// Custom Fields
router.get('/custom-fields', authorize('admin', 'staff'), getCustomFields);
router.post('/custom-fields', authorize('admin'), createCustomField);
router.put('/custom-fields/:id', authorize('admin'), updateCustomField);
router.delete('/custom-fields/:id', authorize('admin'), deleteCustomField);

// Templates (WhatsApp & Email)
router.get('/templates', authorize('admin', 'staff'), getTemplates);
router.post('/templates', authorize('admin'), createTemplate);
router.put('/templates/:id', authorize('admin'), updateTemplate);
router.delete('/templates/:id', authorize('admin'), deleteTemplate);

// Dispatch email to lead using Nodemailer
router.post('/send-lead-email', authorize('admin', 'staff'), sendLeadEmailWithTemplate);

export default router;
