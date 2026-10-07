import { Router } from 'express';
import { db } from '../db';
import { voteAllocations, startups, adminSettings, votes } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

const router = Router();

router.get('/', (req, res) => {
  const settings = db.select().from(adminSettings).get();
  
  if (!settings || settings.leaderboardVisibility === 'hidden') {
    return res.json({ success: true, data: { leaderboard: [], visibility: 'hidden' } });
  }

  // Calculate leaderboard
  const allocations = db.select({
    startupId: voteAllocations.startupId,
    totalCredits: sql<number>`SUM(${voteAllocations.credits})`
  })
  .from(voteAllocations)
  .groupBy(voteAllocations.startupId)
  .all();

  // Get distinct investor counts
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
      imagePath: startup.imagePath,
      totalCredits,
      investorCount,
      averageInvestment: investorCount > 0 ? Math.round(totalCredits / investorCount) : 0
    };
  });

  // Sort by total credits, then by tie break rules (investor count -> average)
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

  res.json({ success: true, data: { leaderboard, visibility: settings.leaderboardVisibility } });
});

export default router;
