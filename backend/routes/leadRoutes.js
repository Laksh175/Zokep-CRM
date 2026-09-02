import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  addFollowupAndUpdateStatus,
  convertLeadToCustomer,
  reassignLead,
  bulkUploadLeads,
  exportLeadsCSV,
  deleteLead,
} from '../controllers/leadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { checkActiveSubscription } from '../middleware/subscriptionCheck.js';

const router = express.Router();

// Configure multer temp storage
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `leads_${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed for bulk upload'));
    }
  },
});

// All routes below are protected
router.use(protect);

router.get('/', authorize('admin', 'staff'), getLeads);
router.get('/export-csv', authorize('admin', 'staff'), exportLeadsCSV);
router.get('/:id', authorize('admin', 'staff'), getLeadById);

// Create lead requires active subscription
router.post('/', authorize('admin', 'staff'), checkActiveSubscription, createLead);
router.put('/:id', authorize('admin', 'staff'), updateLead);
router.post('/:id/followup', authorize('admin', 'staff'), addFollowupAndUpdateStatus);
router.post('/:id/convert', authorize('admin', 'staff'), convertLeadToCustomer);

// Admin-only actions
router.put('/:id/reassign', authorize('admin'), reassignLead);
router.post('/bulk-upload', authorize('admin'), checkActiveSubscription, upload.single('file'), bulkUploadLeads);
router.delete('/:id', authorize('admin'), deleteLead);

export default router;
