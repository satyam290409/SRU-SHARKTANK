import { Router } from 'express';
import { db } from '../db';
import { participants, startups, voters, adminSettings, activityLogs, votingRounds, voteAllocations, votes } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireAdmin } from '../middleware/auth';
import { logActivity } from '../utils/logger';
import { upload } from '../middleware/upload';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

const router = Router();
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', (req, res) => {
  const totalParticipants = db.select({ count: sql`COUNT(*)` }).from(participants).get();
  const totalStartups = db.select({ count: sql`COUNT(*)` }).from(startups).get();
  const totalVoters = db.select({ count: sql`COUNT(*)` }).from(voters).get();
  const round = db.select().from(votingRounds).orderBy(votingRounds.createdAt).get();
  
  res.json({
    success: true,
    data: {
      participants: totalParticipants?.count || 0,
      startups: totalStartups?.count || 0,
      voters: totalVoters?.count || 0,
      votingStatus: round?.status || 'closed',
    }
  });
});

// Participants
router.get('/participants', (req, res) => {
  res.json({ success: true, data: db.select().from(participants).all() });
});

router.post('/participants', (req, res) => {
  const id = uuidv4();
  const data = { ...req.body, id };
  db.insert(participants).values(data).run();
  logActivity('admin', 'admin', 'CREATE_PARTICIPANT', `Created participant ${data.name}`);
  res.json({ success: true, data: { id } });
});

router.put('/participants/:id', (req, res) => {
  db.update(participants).set(req.body).where(eq(participants.id, req.params.id)).run();
  res.json({ success: true });
});

router.delete('/participants/:id', (req, res) => {
  db.update(participants).set({ status: 'inactive' }).where(eq(participants.id, req.params.id)).run();
  res.json({ success: true });
});

// Startups
router.get('/startups', (req, res) => {
  res.json({ success: true, data: db.select().from(startups).all() });
});

router.post('/startups', (req, res) => {
  const id = uuidv4();
  db.insert(startups).values({ ...req.body, id }).run();
  logActivity('admin', 'admin', 'CREATE_STARTUP', `Created startup ${req.body.name}`);
  res.json({ success: true, data: { id } });
});

router.put('/startups/:id', (req, res) => {
  db.update(startups).set(req.body).where(eq(startups.id, req.params.id)).run();
  res.json({ success: true });
});

router.delete('/startups/:id', (req, res) => {
  db.update(startups).set({ status: 'inactive' }).where(eq(startups.id, req.params.id)).run();
  res.json({ success: true });
});

router.post('/startups/:id/image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });
  db.update(startups).set({ imagePath: req.file.path }).where(eq(startups.id, req.params.id)).run();
  res.json({ success: true, data: { path: req.file.path } });
});

// Voters
router.get('/voters', (req, res) => {
  res.json({ success: true, data: db.select().from(voters).all() });
});

router.delete('/voters/:id', (req, res) => {
  db.update(voters).set({ status: 'inactive' }).where(eq(voters.id, req.params.id)).run();
  res.json({ success: true });
});

// Voting controls
router.get('/voting/status', (req, res) => {
  const settings = db.select().from(adminSettings).get();
  const round = db.select().from(votingRounds).orderBy(votingRounds.createdAt).get();
  const totalVoters = db.select({ count: sql`COUNT(*)` }).from(voters).get();
  const votersSubmitted = db.select({ count: sql`COUNT(*)` }).from(voters).where(eq(voters.votingStatus, 'submitted')).get();

  res.json({
    success: true,
    data: {
      votingStatus: round?.status || 'closed',
      votersSubmitted: votersSubmitted?.count || 0,
      totalVoters: totalVoters?.count || 0,
      leaderboardVisibility: settings?.leaderboardVisibility || 'hidden',
      resultsRevealed: settings?.resultsRevealed ? true : false,
    }
  });
});

router.post('/voting/open', (req, res) => {
  db.update(votingRounds).set({ status: 'open', openedAt: new Date().toISOString() }).where(eq(votingRounds.roundNumber, 1)).run();
  logActivity('admin', 'admin', 'VOTING_OPENED', 'Opened voting');
  res.json({ success: true });
});

router.post('/voting/close', (req, res) => {
  db.update(votingRounds).set({ status: 'closed', closedAt: new Date().toISOString() }).where(eq(votingRounds.roundNumber, 1)).run();
  logActivity('admin', 'admin', 'VOTING_CLOSED', 'Closed voting');
  res.json({ success: true });
});

router.post('/voting/pause', (req, res) => {
  db.update(votingRounds).set({ status: 'paused' }).where(eq(votingRounds.roundNumber, 1)).run();
  logActivity('admin', 'admin', 'VOTING_PAUSED', 'Paused voting');
  res.json({ success: true });
});

router.post('/voting/next-pitch', (req, res) => {
  res.json({ success: true });
});

router.post('/voting/reset-round', (req, res) => {
  res.json({ success: true });
});

// Settings
router.get('/settings', (req, res) => {
  res.json({ success: true, data: db.select().from(adminSettings).get() });
});

router.put('/settings', (req, res) => {
  db.update(adminSettings).set(req.body).run(); // Needs ID if multiple, but we assume 1 event
  logActivity('admin', 'admin', 'UPDATE_SETTINGS', 'Updated admin settings');
  res.json({ success: true });
});

// Admin Leaderboard
router.get('/leaderboard', (req, res) => {
  const settings = db.select().from(adminSettings).get();
  
  const allocations = db.select({
    startupId: voteAllocations.startupId,
    totalCredits: sql<number>`SUM(${voteAllocations.credits})`
  }).from(voteAllocations).groupBy(voteAllocations.startupId).all();

  const distinctInvestors = db.select({
    startupId: voteAllocations.startupId,
    investorCount: sql<number>`COUNT(DISTINCT ${votes.voterId})`
  })
  .from(voteAllocations)
  .leftJoin(votes, eq(voteAllocations.voteId, votes.id))
  .where(sql`${voteAllocations.credits} > 0`)
  .groupBy(voteAllocations.startupId)
  .all();

  const allStartups = db.select().from(startups).where(eq(startups.status, 'active')).all();

  let leaderboard = allStartups.map(startup => {
    const alloc = allocations.find(a => a.startupId === startup.id);
    const investors = distinctInvestors.find(i => i.startupId === startup.id);
    const totalCredits = alloc ? (alloc.totalCredits as number) : 0;
    const investorCount = investors ? (investors.investorCount as number) : 0;
    return {
      startupId: startup.id,
      startupName: startup.name,
      category: startup.category,
      totalCredits,
      investorCount,
      averageInvestment: investorCount > 0 ? Math.round(totalCredits / investorCount) : 0
    };
  });

  leaderboard.sort((a, b) => {
    if (b.totalCredits !== a.totalCredits) return b.totalCredits - a.totalCredits;
    if (b.investorCount !== a.investorCount) return b.investorCount - a.investorCount;
    return b.averageInvestment - a.averageInvestment;
  });

  const totalCreditsInvested = leaderboard.reduce((sum, item) => sum + item.totalCredits, 0);

  leaderboard = leaderboard.map((item, index) => ({
    ...item,
    rank: index + 1,
    percentage: totalCreditsInvested > 0 ? Math.round((item.totalCredits / totalCreditsInvested) * 100) : 0
  }));

  res.json({ success: true, data: { leaderboard, visibility: settings?.leaderboardVisibility || 'hidden' } });
});

// Results controls
router.get('/results', (req, res) => {
  const settings = db.select().from(adminSettings).get();
  // Get calculated results (duplicate the logic or just run the query)
  
  const allocations = db.select({
    startupId: voteAllocations.startupId,
    totalCredits: sql<number>`SUM(${voteAllocations.credits})`
  }).from(voteAllocations).groupBy(voteAllocations.startupId).all();

  const distinctInvestors = db.select({
    startupId: voteAllocations.startupId,
    investorCount: sql<number>`COUNT(DISTINCT ${votes.voterId})`
  })
  .from(voteAllocations)
  .leftJoin(votes, eq(voteAllocations.voteId, votes.id))
  .where(sql`${voteAllocations.credits} > 0`)
  .groupBy(voteAllocations.startupId)
  .all();

  const allStartups = db.select().from(startups).where(eq(startups.status, 'active')).all();

  let leaderboard = allStartups.map(startup => {
    const alloc = allocations.find(a => a.startupId === startup.id);
    const investors = distinctInvestors.find(i => i.startupId === startup.id);
    const totalCredits = alloc ? (alloc.totalCredits as number) : 0;
    const investorCount = investors ? (investors.investorCount as number) : 0;
    return {
      startupId: startup.id,
      startupName: startup.name,
      category: startup.category,
      totalCredits,
      investorCount,
      averageInvestment: investorCount > 0 ? Math.round(totalCredits / investorCount) : 0
    };
  });

  leaderboard.sort((a, b) => {
    if (b.totalCredits !== a.totalCredits) return b.totalCredits - a.totalCredits;
    if (b.investorCount !== a.investorCount) return b.investorCount - a.investorCount;
    return b.averageInvestment - a.averageInvestment;
  });

  res.json({
    success: true,
    data: {
      results: leaderboard,
      revealed: settings?.resultsRevealed ? true : false
    }
  });
});

router.post('/results/reveal', (req, res) => {
  db.update(adminSettings).set({ resultsRevealed: 1 }).run();
  logActivity('admin', 'admin', 'RESULTS_REVEALED', 'Revealed results');
  if (req.app.get('io')) req.app.get('io').emit('leaderboard-update');
  res.json({ success: true });
});

router.post('/results/hide', (req, res) => {
  db.update(adminSettings).set({ resultsRevealed: 0 }).run();
  if (req.app.get('io')) req.app.get('io').emit('leaderboard-update');
  res.json({ success: true });
});

router.post('/leaderboard/visibility', (req, res) => {
  const { visibility } = req.body;
  db.update(adminSettings).set({ leaderboardVisibility: visibility }).run();
  if (req.app.get('io')) req.app.get('io').emit('leaderboard-update');
  res.json({ success: true });
});

// Logs
router.get('/activity-logs', (req, res) => {
  res.json({ success: true, data: db.select().from(activityLogs).orderBy(sql`${activityLogs.createdAt} DESC`).limit(100).all() });
});

// QR Code
router.get('/qr-code', async (req, res) => {
  try {
    const type = req.query.type as string;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    let targetUrl = clientUrl;

    if (type === 'voter') targetUrl += '/voter/login';
    else if (type === 'participant') targetUrl += '/participant/login';
    else if (type === 'leaderboard') targetUrl += '/leaderboard';
    
    const qrCodeDataUrl = await QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0a0e27',
        light: '#ffffff'
      }
    });

    res.json({ success: true, data: { qr: qrCodeDataUrl, url: targetUrl } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate QR code' });
  }
});

export default router;
