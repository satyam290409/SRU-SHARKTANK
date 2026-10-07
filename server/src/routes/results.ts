import { Router } from 'express';
import { db } from '../db';
import { adminSettings, voteAllocations, startups, votes, participants } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { authenticate } from '../middleware/auth';

const router = Router();

// Helper to calculate leaderboard stats for results
const getCalculatedResults = () => {
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

  let results = allStartups.map(startup => {
    const alloc = allocations.find(a => a.startupId === startup.id);
    const investors = distinctInvestors.find(i => i.startupId === startup.id);
    
    const totalCredits = alloc ? (alloc.totalCredits as number) : 0;
    const investorCount = investors ? (investors.investorCount as number) : 0;
    
    return {
      startupId: startup.id,
      startupName: startup.name,
      category: startup.category,
      imagePath: startup.imagePath,
      totalCredits,
      investorCount,
      averageInvestment: investorCount > 0 ? Math.round(totalCredits / investorCount) : 0,
    };
  });

  results.sort((a, b) => {
    if (b.totalCredits !== a.totalCredits) return b.totalCredits - a.totalCredits;
    if (b.investorCount !== a.investorCount) return b.investorCount - a.investorCount;
    return b.averageInvestment - a.averageInvestment;
  });

  const totalCreditsInvested = results.reduce((sum, item) => sum + item.totalCredits, 0);

  return results.map((item, index) => ({
    ...item,
    rank: index + 1,
    percentage: totalCreditsInvested > 0 ? Math.round((item.totalCredits / totalCreditsInvested) * 100) : 0,
    isWinner: index === 0 && item.totalCredits > 0
  }));
};

// GET /api/results
router.get('/', (req, res) => {
  const settings = db.select().from(adminSettings).get();
  
  if (!settings || !settings.resultsRevealed) {
    return res.status(403).json({ error: 'Results have not been revealed yet' });
  }
  
  const results = getCalculatedResults();
  res.json({ success: true, data: { results } });
});

// GET /api/participant/dashboard
router.get('/participant/dashboard', authenticate, (req: any, res) => {
  if (req.user.role !== 'participant') {
    return res.status(403).json({ error: 'Participant access required' });
  }

  const participant = db.select().from(participants).where(eq(participants.id, req.user.id)).get();
  if (!participant) return res.status(404).json({ error: 'Participant not found' });

  const startup = participant.startupId ? db.select().from(startups).where(eq(startups.id, participant.startupId)).get() : null;
  const settings = db.select().from(adminSettings).get();

  const results = getCalculatedResults();
  const myPerformance = startup ? results.find(r => r.startupId === startup.id) : null;
  
  // Only send full results array if they are revealed
  const isRevealed = settings?.resultsRevealed ? true : false;
  
  // Leaderboard info
  let leaderboardData = [];
  if (settings && (settings.leaderboardVisibility === 'live' || settings.leaderboardVisibility === 'frozen' || settings.leaderboardVisibility === 'final')) {
      leaderboardData = results;
  }
  
  // If results not revealed, performance might be hidden based on requirements, but normally participants want to see it live? The spec says "Show: Current rank...". I'll pass performance.
  res.json({ 
    success: true, 
    data: {
      participant, 
      startup,
      performance: myPerformance,
      eventStatus: 'live', // Simplified for now
      leaderboard: leaderboardData,
      leaderboardVisibility: settings?.leaderboardVisibility || 'hidden',
      resultsRevealed: isRevealed,
      results: isRevealed ? results : []
    }
  });
});

export default router;
