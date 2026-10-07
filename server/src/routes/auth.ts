import { Router } from 'express';
import { db } from '../db';
import { voters, participants } from '../db/schema';
import { eq } from 'drizzle-orm';
import { signToken } from '../utils/jwt';
import { loginSchema, participantLoginSchema, voterLoginSchema } from '../utils/validation';
import { logActivity } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/admin/login', (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error });

  const { email, password } = result.data;
  
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = signToken({ role: 'admin', email });
    logActivity('admin', 'admin', 'ADMIN_LOGIN', 'Admin logged in', null, req.ip);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    return res.json({ success: true, data: { role: 'admin', email, name: 'Admin', id: 'admin' } });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

router.post('/participant/login', (req, res) => {
  const result = participantLoginSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error });

  const { name, enrollmentNumber, password } = result.data;
  
  if (password !== (process.env.DEFAULT_PARTICIPANT_PASSWORD || 'shark@2026')) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const participant = db.select().from(participants).where(eq(participants.enrollmentNumber, enrollmentNumber)).get();
  
  if (!participant || participant.status !== 'active') {
    return res.status(401).json({ error: 'Invalid participant or inactive' });
  }

  const token = signToken({ id: participant.id, role: 'participant', enrollmentNumber });
  logActivity(participant.id, 'participant', 'PARTICIPANT_LOGIN', 'Participant logged in', null, req.ip);
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  return res.json({ success: true, data: { ...participant, role: 'participant' } });
});

router.post('/voter/login', (req, res) => {
  const result = voterLoginSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error });

  const { name, enrollmentNumber, password } = result.data;
  
  if (password !== (process.env.DEFAULT_VOTER_PASSWORD || 'sharkvoter@2026')) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  let voter = db.select().from(voters).where(eq(voters.enrollmentNumber, enrollmentNumber)).get();
  
  if (!voter) {
    const id = uuidv4();
    db.insert(voters).values({ id, name, enrollmentNumber }).run();
    voter = db.select().from(voters).where(eq(voters.id, id)).get()!;
  } else if (voter.status !== 'active') {
    return res.status(401).json({ error: 'Account is inactive' });
  }

  const token = signToken({ id: voter.id, role: 'voter', enrollmentNumber });
  db.update(voters).set({ lastLoginAt: new Date().toISOString() }).where(eq(voters.id, voter.id)).run();
  logActivity(voter.id, 'voter', 'VOTER_LOGIN', 'Voter logged in', null, req.ip);
  
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  return res.json({ success: true, data: { ...voter, role: 'voter' } });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

router.get('/me', authenticate, (req: any, res) => {
  if (req.user.role === 'admin') {
    return res.json({ success: true, data: { role: 'admin', email: req.user.email, name: 'Admin', id: 'admin' } });
  }
  
  if (req.user.role === 'participant') {
    const participant = db.select().from(participants).where(eq(participants.id, req.user.id)).get();
    if (participant) return res.json({ success: true, data: { ...participant, role: 'participant' } });
  }
  
  if (req.user.role === 'voter') {
    const voter = db.select().from(voters).where(eq(voters.id, req.user.id)).get();
    if (voter) return res.json({ success: true, data: { ...voter, role: 'voter' } });
  }
  
  return res.status(404).json({ success: false, error: 'User not found' });
});

export default router;
