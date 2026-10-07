import { Router } from 'express';
import { db } from '../db';
import { votes, voteAllocations, voters, startups, adminSettings, votingRounds, participants } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireVoter } from '../middleware/auth';
import { voteAllocationSchema } from '../utils/validation';
import { logActivity } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
router.use(requireVoter);

router.post('/', (req: any, res) => {
  const voterId = req.user.id;
  const voterEnrollment = req.user.enrollmentNumber;

  // 1 & 2. Check voting is open
  const round = db.select().from(votingRounds).where(eq(votingRounds.status, 'open')).get();
  if (!round) return res.status(403).json({ error: 'Voting is not currently open' });

  // 3. Validate allocations array with Zod
  const result = voteAllocationSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error });

  const { allocations } = result.data;
  const settings = db.select().from(adminSettings).get()!;
  
  let totalCreditsRequested = 0;
  
  for (const alloc of allocations) {
    // 4 & 5. Check no negative values, check all values are integers (handled by zod)
    totalCreditsRequested += alloc.credits;

    // 7. Check all startupIds are valid and active
    const startup = db.select().from(startups).where(eq(startups.id, alloc.startupId)).get();
    if (!startup || startup.status !== 'active') {
      return res.status(400).json({ error: `Invalid or inactive startup: ${alloc.startupId}` });
    }

    // 8. If preventSelfVoting is enabled, check voter's enrollment doesn't match any allocated startup's participant
    if (settings.preventSelfVoting) {
      const participant = db.select().from(participants).where(eq(participants.startupId, alloc.startupId)).get();
      if (participant && participant.enrollmentNumber === voterEnrollment && alloc.credits > 0) {
        return res.status(403).json({ error: 'Self-voting is not permitted' });
      }
    }
  }

  // 6. Check total doesn't exceed credit pool
  if (totalCreditsRequested > settings.creditPool!) {
    return res.status(400).json({ error: 'Total allocated credits exceed the allowed credit pool' });
  }

  // 9. Check voter hasn't already submitted (unless allowVoteEditing is true)
  const existingVote = db.select().from(votes).where(eq(votes.voterId, voterId)).get();
  if (existingVote && !settings.allowVoteEditing) {
    return res.status(403).json({ error: 'You have already voted and editing is disabled' });
  }

  // 10. Use a transaction
  try {
    db.transaction((tx) => {
      // delete old allocations and vote record
      if (existingVote) {
        tx.delete(voteAllocations).where(eq(voteAllocations.voteId, existingVote.id)).run();
        tx.delete(votes).where(eq(votes.id, existingVote.id)).run();
      }

      // create vote record
      const newVoteId = uuidv4();
      tx.insert(votes).values({
        id: newVoteId,
        voterId,
        votingRoundId: round.id,
        eventId: round.eventId,
        status: 'submitted',
        submittedAt: new Date().toISOString()
      }).run();

      // create all allocation records
      for (const alloc of allocations) {
        tx.insert(voteAllocations).values({
          id: uuidv4(),
          voteId: newVoteId,
          startupId: alloc.startupId,
          credits: alloc.credits
        }).run();
      }

      // update voter creditsUsed
      tx.update(voters).set({ 
        creditsUsed: totalCreditsRequested,
        votingStatus: 'submitted'
      }).where(eq(voters.id, voterId)).run();
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    return res.status(500).json({ error: 'Failed to submit vote' });
  }

  // 11. Emit socket event 'leaderboard-update' (Assuming io is attached to req by a middleware, or we can just send success and rely on client polling or global io)
  if (req.app.get('io')) {
    req.app.get('io').emit('leaderboard-update');
  }

  // 12. Log activity
  logActivity(voterId, 'voter', 'VOTE_SUBMITTED', `Voter allocated ${totalCreditsRequested} credits`);

  // 13. Return success
  res.json({ success: true, message: 'Vote submitted successfully' });
});

router.get('/me', (req: any, res) => {
  const existingVote = db.select().from(votes).where(eq(votes.voterId, req.user.id)).get();
  const voter = db.select().from(voters).where(eq(voters.id, req.user.id)).get();
  
  if (!existingVote) return res.json({ success: true, data: { allocations: [], hasVoted: false, totalCredits: voter?.totalCredits || 100 } });

  const allocations = db.select().from(voteAllocations).where(eq(voteAllocations.voteId, existingVote.id)).all();
  res.json({ success: true, data: { allocations, hasVoted: true, totalCredits: voter?.totalCredits || 100 } });
});

router.get('/status', (req: any, res) => {
  const round = db.select().from(votingRounds).orderBy(votingRounds.createdAt).get();
  res.json({ success: true, data: { status: round?.status || 'closed' } });
});

export default router;
