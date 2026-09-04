import { apiClient } from './client';
import { WatchlistEntity, WatchlistMatchCandidate } from '../types';

export const watchlistsApi = {
  async getWatchlists(params?: {
    category?: string;
    priority?: string;
    search?: string;
    status?: string;
  }): Promise<WatchlistEntity[]> {
    const res = await apiClient.get('/watchlists', { params });
    return res.data;
  },

  async createWatchlistEntity(entity: Partial<WatchlistEntity>): Promise<WatchlistEntity> {
    const res = await apiClient.post('/watchlists', entity);
    return res.data;
  },

  async updateWatchlistEntity(id: string, entity: Partial<WatchlistEntity>): Promise<WatchlistEntity> {
    const res = await apiClient.patch(`/watchlists/${id}`, entity);
    return res.data;
  },

  async deleteWatchlistEntity(id: string): Promise<void> {
    await apiClient.delete(`/watchlists/${id}`);
  },

  async matchCandidateDiagnostic(data: {
    identifier: string;
    ocr_confidence?: number;
    category?: string;
  }): Promise<{ matches: WatchlistMatchCandidate[]; best_match?: WatchlistMatchCandidate }> {
    const res = await apiClient.post('/watchlists/match', data);
    return res.data;
  },
};
