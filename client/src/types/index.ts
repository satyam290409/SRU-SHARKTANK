// ==================== AUTH TYPES ====================
export type UserRole = 'admin' | 'participant' | 'voter';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  enrollmentNumber?: string;
  startupId?: string;
  startupName?: string;
}

export interface LoginCredentials {
  email?: string;
  name?: string;
  enrollmentNumber?: string;
  password: string;
}

// ==================== EVENT TYPES ====================
export type EventStatus = 'draft' | 'live' | 'paused' | 'closed';
export type VotingMode = 'per_pitch' | 'all_at_once';

export interface Event {
  id: string;
  name: string;
  date: string;
  status: EventStatus;
  votingMode: VotingMode;
  createdAt: string;
}

// ==================== STARTUP TYPES ====================
export interface Startup {
  id: string;
  eventId: string;
  name: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  imagePath: string | null;
  pitchOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
  participantName?: string;
  participantEnrollment?: string;
}

// ==================== PARTICIPANT TYPES ====================
export interface Participant {
  id: string;
  name: string;
  enrollmentNumber: string;
  email: string | null;
  phone: string | null;
  startupId: string | null;
  startupName?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// ==================== VOTER TYPES ====================
export type VotingStatus = 'pending' | 'submitted' | 'locked';

export interface Voter {
  id: string;
  name: string;
  enrollmentNumber: string;
  totalCredits: number;
  creditsUsed: number;
  status: 'active' | 'inactive';
  votingStatus: VotingStatus;
  lastLoginAt: string | null;
  createdAt: string;
}

// ==================== VOTING TYPES ====================
export type RoundStatus = 'pending' | 'open' | 'paused' | 'closed';

export interface VotingRound {
  id: string;
  eventId: string;
  startupId: string | null;
  roundNumber: number;
  status: RoundStatus;
  openedAt: string | null;
  closedAt: string | null;
  startupName?: string;
}

export interface VoteAllocation {
  startupId: string;
  startupName?: string;
  credits: number;
}

export interface Vote {
  id: string;
  voterId: string;
  votingRoundId: string | null;
  eventId: string;
  status: 'draft' | 'submitted' | 'locked';
  allocations: VoteAllocation[];
  submittedAt: string | null;
}

export interface SubmitVotePayload {
  allocations: VoteAllocation[];
}

// ==================== LEADERBOARD TYPES ====================
export type LeaderboardVisibility = 'hidden' | 'live' | 'frozen' | 'final';

export interface LeaderboardEntry {
  rank: number;
  startupId: string;
  startupName: string;
  category: string;
  imagePath: string | null;
  totalCredits: number;
  percentage: number;
  investorCount: number;
  averageInvestment: number;
}

// ==================== SETTINGS TYPES ====================
export interface AdminSettings {
  id: string;
  eventId: string;
  creditPool: number;
  virtualInvestmentValue: number;
  preventSelfVoting: boolean;
  allowVoteEditing: boolean;
  leaderboardVisibility: LeaderboardVisibility;
  resultsRevealed: boolean;
  judgeCreditPool: number;
  judgeWeight: number;
  audienceWeight: number;
  tieBreakRule: string;
}

// ==================== DASHBOARD TYPES ====================
export interface DashboardStats {
  totalStartups: number;
  totalParticipants: number;
  totalVoters: number;
  totalCreditsDistributed: number;
  totalCreditsInvested: number;
  votingStatus: string;
  currentRound: VotingRound | null;
  eventStatus: EventStatus;
}

// ==================== RESULTS TYPES ====================
export interface ResultEntry {
  rank: number;
  startupId: string;
  startupName: string;
  category: string;
  imagePath: string | null;
  totalCredits: number;
  percentage: number;
  investorCount: number;
  averageInvestment: number;
  isWinner: boolean;
}

// ==================== ACTIVITY LOG TYPES ====================
export interface ActivityLog {
  id: string;
  eventId: string;
  userId: string;
  userRole: string;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

// ==================== API RESPONSE TYPES ====================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ==================== PARTICIPANT DASHBOARD ====================
export interface ParticipantDashboard {
  participant: Participant;
  startup: Startup | null;
  performance: {
    rank: number;
    totalCredits: number;
    percentage: number;
    investorCount: number;
  } | null;
  eventStatus: EventStatus;
  leaderboard: LeaderboardEntry[];
  leaderboardVisibility: LeaderboardVisibility;
  resultsRevealed: boolean;
  results: ResultEntry[];
}
