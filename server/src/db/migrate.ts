import { db } from './index';
import { sql } from 'drizzle-orm';

export function runMigrations() {
  console.log('Running migrations...');
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      date TEXT,
      status TEXT DEFAULT 'draft',
      votingMode TEXT DEFAULT 'per_pitch',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS startups (
      id TEXT PRIMARY KEY,
      eventId TEXT,
      name TEXT NOT NULL,
      category TEXT,
      shortDescription TEXT,
      fullDescription TEXT,
      imagePath TEXT,
      pitchOrder INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT,
      FOREIGN KEY(eventId) REFERENCES events(id)
    )`,
    `CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      enrollmentNumber TEXT NOT NULL UNIQUE,
      email TEXT,
      phone TEXT,
      startupId TEXT,
      status TEXT DEFAULT 'active',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(startupId) REFERENCES startups(id)
    )`,
    `CREATE TABLE IF NOT EXISTS voters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      enrollmentNumber TEXT NOT NULL UNIQUE,
      totalCredits INTEGER DEFAULT 100,
      creditsUsed INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      votingStatus TEXT DEFAULT 'pending',
      lastLoginAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS voting_rounds (
      id TEXT PRIMARY KEY,
      eventId TEXT,
      startupId TEXT,
      roundNumber INTEGER,
      status TEXT DEFAULT 'pending',
      openedAt TEXT,
      closedAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(eventId) REFERENCES events(id),
      FOREIGN KEY(startupId) REFERENCES startups(id)
    )`,
    `CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      voterId TEXT,
      votingRoundId TEXT,
      eventId TEXT,
      status TEXT DEFAULT 'draft',
      submittedAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(voterId) REFERENCES voters(id),
      FOREIGN KEY(votingRoundId) REFERENCES voting_rounds(id),
      FOREIGN KEY(eventId) REFERENCES events(id)
    )`,
    `CREATE TABLE IF NOT EXISTS vote_allocations (
      id TEXT PRIMARY KEY,
      voteId TEXT,
      startupId TEXT,
      credits INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(voteId) REFERENCES votes(id),
      FOREIGN KEY(startupId) REFERENCES startups(id)
    )`,
    `CREATE TABLE IF NOT EXISTS admin_settings (
      id TEXT PRIMARY KEY,
      eventId TEXT,
      creditPool INTEGER DEFAULT 100,
      virtualInvestmentValue INTEGER DEFAULT 50000,
      preventSelfVoting INTEGER DEFAULT 1,
      allowVoteEditing INTEGER DEFAULT 0,
      leaderboardVisibility TEXT DEFAULT 'hidden',
      resultsRevealed INTEGER DEFAULT 0,
      judgeCreditPool INTEGER DEFAULT 500,
      judgeWeight INTEGER DEFAULT 5,
      audienceWeight INTEGER DEFAULT 1,
      tieBreakRule TEXT DEFAULT 'investors_then_average',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT,
      FOREIGN KEY(eventId) REFERENCES events(id)
    )`,
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      eventId TEXT,
      userId TEXT,
      userRole TEXT,
      action TEXT NOT NULL,
      details TEXT,
      ipAddress TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      role TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const query of tables) {
    db.run(sql.raw(query));
  }

  console.log('Migrations completed successfully.');
}

if (require.main === module) {
  runMigrations();
  process.exit(0);
}
