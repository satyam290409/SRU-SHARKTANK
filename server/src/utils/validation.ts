import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const participantLoginSchema = z.object({
  name: z.string().min(1),
  enrollmentNumber: z.string().min(1),
  password: z.string().min(1),
});

export const voterLoginSchema = z.object({
  name: z.string().min(1),
  enrollmentNumber: z.string().min(1),
  password: z.string().min(1),
});

export const voteAllocationSchema = z.object({
  allocations: z.array(z.object({
    startupId: z.string().uuid(),
    credits: z.number().int().min(0)
  }))
});

export const startupSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  pitchOrder: z.number().int().optional(),
  status: z.enum(['active', 'inactive']).optional()
});

export const participantSchema = z.object({
  name: z.string().min(1),
  enrollmentNumber: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  startupId: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive']).optional()
});

export const adminSettingsSchema = z.object({
  creditPool: z.number().int().min(0).optional(),
  virtualInvestmentValue: z.number().int().min(0).optional(),
  preventSelfVoting: z.number().int().min(0).max(1).optional(),
  allowVoteEditing: z.number().int().min(0).max(1).optional(),
  leaderboardVisibility: z.enum(['hidden', 'live', 'frozen', 'final']).optional(),
  resultsRevealed: z.number().int().min(0).max(1).optional(),
  judgeCreditPool: z.number().int().min(0).optional(),
  judgeWeight: z.number().int().min(0).optional(),
  audienceWeight: z.number().int().min(0).optional(),
  tieBreakRule: z.string().optional()
});
