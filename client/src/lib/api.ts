import type { ApiResponse } from '@/types';

const BASE_URL = '/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
      delete (config.headers as Record<string, string>)['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `Request failed with status ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Auth
  async adminLogin(email: string, password: string) {
    return this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async participantLogin(name: string, enrollmentNumber: string, password: string) {
    return this.request('/auth/participant/login', {
      method: 'POST',
      body: JSON.stringify({ name, enrollmentNumber, password }),
    });
  }

  async voterLogin(name: string, enrollmentNumber: string, password: string) {
    return this.request('/auth/voter/login', {
      method: 'POST',
      body: JSON.stringify({ name, enrollmentNumber, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Admin Dashboard
  async getDashboardStats() {
    return this.request('/admin/dashboard');
  }

  // Participants
  async getParticipants() {
    return this.request('/admin/participants');
  }

  async createParticipant(data: Record<string, unknown>) {
    return this.request('/admin/participants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateParticipant(id: string, data: Record<string, unknown>) {
    return this.request(`/admin/participants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteParticipant(id: string) {
    return this.request(`/admin/participants/${id}`, { method: 'DELETE' });
  }

  // Startups (Admin)
  async getAdminStartups() {
    return this.request('/admin/startups');
  }

  async createStartup(data: Record<string, unknown>) {
    return this.request('/admin/startups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStartup(id: string, data: Record<string, unknown>) {
    return this.request(`/admin/startups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStartup(id: string) {
    return this.request(`/admin/startups/${id}`, { method: 'DELETE' });
  }

  async uploadStartupImage(id: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.request(`/admin/startups/${id}/image`, {
      method: 'POST',
      body: formData,
    });
  }

  // Startups (Public)
  async getStartups() {
    return this.request('/startups');
  }

  async getStartup(id: string) {
    return this.request(`/startups/${id}`);
  }

  // Voters
  async getVoters() {
    return this.request('/admin/voters');
  }

  async deleteVoter(id: string) {
    return this.request(`/admin/voters/${id}`, { method: 'DELETE' });
  }

  // Voting Control
  async getAdminVotingStatus() {
    return this.request('/admin/voting/status');
  }

  async openVoting() {
    return this.request('/admin/voting/open', { method: 'POST' });
  }

  async closeVoting() {
    return this.request('/admin/voting/close', { method: 'POST' });
  }

  async pauseVoting() {
    return this.request('/admin/voting/pause', { method: 'POST' });
  }

  async nextPitch() {
    return this.request('/admin/voting/next-pitch', { method: 'POST' });
  }

  async resetRound() {
    return this.request('/admin/voting/reset-round', { method: 'POST' });
  }

  // Votes
  async submitVote(allocations: Array<{ startupId: string; credits: number }>) {
    return this.request('/votes', {
      method: 'POST',
      body: JSON.stringify({ allocations }),
    });
  }

  async getMyVotes() {
    return this.request('/votes/me');
  }

  async getVotingStatus() {
    return this.request('/votes/status');
  }

  // Leaderboard
  async getAdminLeaderboard() {
    return this.request('/admin/leaderboard');
  }

  async getLeaderboard() {
    return this.request('/leaderboard');
  }

  // Results
  async getAdminResults() {
    return this.request('/admin/results');
  }

  async getResults() {
    return this.request('/results');
  }

  async revealResults() {
    return this.request('/admin/results/reveal', { method: 'POST' });
  }

  async hideResults() {
    return this.request('/admin/results/hide', { method: 'POST' });
  }

  // Leaderboard Visibility
  async setLeaderboardVisibility(visibility: string) {
    return this.request('/admin/leaderboard/visibility', {
      method: 'POST',
      body: JSON.stringify({ visibility }),
    });
  }

  // Settings
  async getSettings() {
    return this.request('/admin/settings');
  }

  async updateSettings(data: Record<string, unknown>) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Activity Logs
  async getActivityLogs() {
    return this.request('/admin/activity-logs');
  }

  // QR Code
  async getQrCode(type: 'voter' | 'participant' | 'leaderboard') {
    return this.request(`/admin/qr-code?type=${type}`);
  }

  // Participant Dashboard
  async getParticipantDashboard() {
    return this.request('/participant/dashboard');
  }
}

export const api = new ApiClient();
export default api;
