import express from 'express';
import {
  getPublicFormConfig,
  submitPublicLead,
  verifyMetaWebhook,
  receiveMetaLeadWebhook,
  verifyWhatsAppWebhook,
  receiveWhatsAppWebhook,
  receiveUniversalLeadWebhook,
} from '../controllers/publicController.js';

const router = express.Router();

// Public Lead Capture Form endpoints
router.get('/form/:tenantId', getPublicFormConfig);
router.post('/form/:tenantId', submitPublicLead);

// Meta (Facebook & Instagram) Instant Lead Ads Webhook
router.get('/webhook/meta/:tenantId', verifyMetaWebhook);
router.post('/webhook/meta/:tenantId', receiveMetaLeadWebhook);

// WhatsApp Cloud API / Inbound Message Webhook
router.get('/webhook/whatsapp/:tenantId', verifyWhatsAppWebhook);
router.post('/webhook/whatsapp/:tenantId', receiveWhatsAppWebhook);

// Universal Inbound Lead Webhook (Zapier, Make, WordPress, Landing Pages)
router.post('/webhook/lead/:tenantId', receiveUniversalLeadWebhook);

export default router;
