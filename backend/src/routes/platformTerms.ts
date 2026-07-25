import { Router } from 'express';
import { PLATFORM_TERMS_VERSION, PLATFORM_TERMS_TITLE, PLATFORM_TERMS_PARAGRAPHS } from '@/content/platformTermsContent';

const router = Router();

// Public — must be readable before an account exists, so the registration
// modal can show it pre-signup.
router.get('/', (_req, res) => {
  res.json({ version: PLATFORM_TERMS_VERSION, title: PLATFORM_TERMS_TITLE, paragraphs: PLATFORM_TERMS_PARAGRAPHS });
});

export default router;
