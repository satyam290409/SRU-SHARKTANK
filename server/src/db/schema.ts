import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  date: text('date'),
  status: text('status', { enum: ['draft', 'live', 'paused', 'closed'] }).default('draft'),
  votingMode: text('votingMode', { enum: ['per_pitch', 'all_at_once'] }).default('per_pitch'),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updatedAt')
});

export const startups = sqliteTable('startups', {
  id: text('id').primaryKey(),
  eventId: text('eventId').references(() => events.id),
  name: text('name').notNull(),
  category: text('category'),
  shortDescription: text('shortDescription'),
  fullDescription: text('fullDescription'),
  imagePath: text('imagePath'),
  pitchOrder: integer('pitchOrder').default(0),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updatedAt')
});

export const participants = sqliteTable('participants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  enrollmentNumber: text('enrollmentNumber').notNull().unique(),
  email: text('email'),
  phone: text('phone'),
  startupId: text('startupId').references(() => startups.id),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`)
});

export const voters = sqliteTable('voters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  enrollmentNumber: text('enrollmentNumber').notNull().unique(),
  totalCredits: integer('totalCredits').default(100),
  creditsUsed: integer('creditsUsed').default(0),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  votingStatus: text('votingStatus', { enum: ['pending', 'submitted', 'locked'] }).default('pending'),
  lastLoginAt: text('lastLoginAt'),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`)
});

export const votingRounds = sqliteTable('voting_rounds', {
  id: text('id').primaryKey(),
  eventId: text('eventId').references(() => events.id),
  startupId: text('startupId').references(() => startups.id),
  roundNumber: integer('roundNumber'),
  status: text('status', { enum: ['pending', 'open', 'paused', 'closed'] }).default('pending'),
  openedAt: text('openedAt'),
  closedAt: text('closedAt'),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`)
});

export const votes = sqliteTable('votes', {
  id: text('id').primaryKey(),
  voterId: text('voterId').references(() => voters.id),
  votingRoundId: text('votingRoundId').references(() => votingRounds.id),
  eventId: text('eventId').references(() => events.id),
  status: text('status', { enum: ['draft', 'submitted', 'locked'] }).default('draft'),
  submittedAt: text('submittedAt'),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`)
});

export const voteAllocations = sqliteTable('vote_allocations', {
  id: text('id').primaryKey(),
  voteId: text('voteId').references(() => votes.id),
  startupId: text('startupId').references(() => startups.id),
  credits: integer('credits').notNull().default(0),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`)
});

export const adminSettings = sqliteTable('admin_settings', {
  id: text('id').primaryKey(),
  eventId: text('eventId').references(() => events.id),
  creditPool: integer('creditPool').default(100),
  virtualInvestmentValue: integer('virtualInvestmentValue').default(50000),
  preventSelfVoting: integer('preventSelfVoting').default(1),
  allowVoteEditing: integer('allowVoteEditing').default(0),
  leaderboardVisibility: text('leaderboardVisibility', { enum: ['hidden', 'live', 'frozen', 'final'] }).default('hidden'),
  resultsRevealed: integer('resultsRevealed').default(0),
  judgeCreditPool: integer('judgeCreditPool').default(500),
  judgeWeight: integer('judgeWeight').default(5),
  audienceWeight: integer('audienceWeight').default(1),
  tieBreakRule: text('tieBreakRule').default('investors_then_average'),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updatedAt')
});

export const activityLogs = sqliteTable('activity_logs', {
  id: text('id').primaryKey(),
  eventId: text('eventId'),
  userId: text('userId'),
  userRole: text('userRole'),
  action: text('action').notNull(),
  details: text('details'),
  ipAddress: text('ipAddress'),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`)
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  role: text('role').notNull(),
  expiresAt: text('expiresAt').notNull(),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`)
});
