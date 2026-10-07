import { Router } from 'express';
import { db } from '../db';
import { startups } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', (req, res) => {
  const activeStartups = db.select().from(startups).where(eq(startups.status, 'active')).all();
  activeStartups.sort((a, b) => (a.pitchOrder || 0) - (b.pitchOrder || 0));
  res.json({ success: true, data: activeStartups });
});

router.get('/:id', (req, res) => {
  const startup = db.select().from(startups).where(eq(startups.id, req.params.id)).get();
  if (!startup) return res.status(404).json({ error: 'Startup not found' });
  res.json({ success: true, data: startup });
});

export default router;
