import express from 'express';
import { getPublicFormConfig, submitPublicLead } from '../controllers/publicController.js';

const router = express.Router();

// Public Lead Capture Form endpoints
router.get('/form/:tenantId', getPublicFormConfig);
router.post('/form/:tenantId', submitPublicLead);

export default router;
