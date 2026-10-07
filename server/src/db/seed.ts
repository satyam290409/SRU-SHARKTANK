import { v4 as uuidv4 } from 'uuid';
import { db } from './index';
import { runMigrations } from './migrate';
import { 
  events, startups, participants, adminSettings, 
  votingRounds, activityLogs 
} from './schema';
import * as schema from './schema';

async function seed() {
  console.log('Starting DB Seed...');

  // 1. Make sure tables exist
  runMigrations();

  // 2. Clear existing (for idempotent seed)
  db.delete(schema.activityLogs).run();
  db.delete(schema.voteAllocations).run();
  db.delete(schema.votes).run();
  db.delete(schema.votingRounds).run();
  db.delete(schema.adminSettings).run();
  db.delete(schema.participants).run();
  db.delete(schema.voters).run();
  db.delete(schema.startups).run();
  db.delete(schema.events).run();

  // 3. Create Event
  const eventId = uuidv4();
  db.insert(events).values({
    id: eventId,
    name: 'SRU Mini Shark Tank 2026',
    status: 'live',
    votingMode: 'all_at_once',
    date: new Date().toISOString(),
  }).run();

  // 4. Create Startups
  const startupData = [
    { name: 'GreenLoop', category: 'Clean Energy', shortDescription: 'Revolutionizing renewable energy solutions for urban households' },
    { name: 'AgriNext', category: 'AgriTech', shortDescription: 'AI-powered precision agriculture for small-scale farmers' },
    { name: 'EduSphere', category: 'EdTech', shortDescription: 'Immersive learning experiences through augmented reality' },
    { name: 'HealthSync', category: 'HealthTech', shortDescription: 'Connecting patients with healthcare providers seamlessly' },
    { name: 'FinNest', category: 'FinTech', shortDescription: 'Making financial planning accessible to college students' },
    { name: 'SkillForge', category: 'EdTech', shortDescription: 'Gamified skill development platform for professionals' },
    { name: 'UrbanFarm', category: 'AgriTech', shortDescription: 'Vertical farming solutions for urban food security' },
    { name: 'ReCycle', category: 'Sustainability', shortDescription: 'AI-powered waste management and recycling platform' },
  ];

  const insertedStartups = [];
  let order = 1;
  for (const s of startupData) {
    const sId = uuidv4();
    db.insert(startups).values({
      id: sId,
      eventId,
      name: s.name,
      category: s.category,
      shortDescription: s.shortDescription,
      fullDescription: s.shortDescription + '. Full details here.',
      pitchOrder: order++,
    }).run();
    insertedStartups.push({ id: sId, name: s.name });
  }

  // 5. Create Participants
  let enrollmentBase = 1;
  for (const s of insertedStartups) {
    db.insert(participants).values({
      id: uuidv4(),
      name: `Participant for ${s.name}`,
      enrollmentNumber: `SRU202600${enrollmentBase++}`,
      startupId: s.id,
    }).run();
  }

  // 6. Admin Settings
  db.insert(adminSettings).values({
    id: uuidv4(),
    eventId,
    creditPool: 100,
    virtualInvestmentValue: 50000,
    preventSelfVoting: 1,
    allowVoteEditing: 0,
    leaderboardVisibility: 'hidden',
    resultsRevealed: 0
  }).run();

  // 7. Initial Voting Round
  db.insert(votingRounds).values({
    id: uuidv4(),
    eventId,
    roundNumber: 1,
    status: 'open',
    openedAt: new Date().toISOString()
  }).run();

  // 8. Activity Log
  db.insert(activityLogs).values({
    id: uuidv4(),
    eventId,
    userId: 'system',
    userRole: 'system',
    action: 'SYSTEM_SEED',
    details: 'Initial database seed complete',
  }).run();

  console.log('DB Seed completed successfully.');
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
