import { apiClient } from './client';
import { WatchlistEntity, WatchlistMatchCandidate } from '../types';

function normalizeWatchlistEntity(e: any): WatchlistEntity {
  return {
    id: e.id,
    entity_type: e.entity_type || 'VEHICLE',
    identifier: e.identifier,
    normalized_identifier: e.normalized_identifier || e.identifier,
    category: e.category || 'STOLEN_VEHICLE',
    priority: e.priority || 'HIGH',
    source_ref: e.source_ref || undefined,
    notes: e.notes || undefined,
    department_id: e.department_id || undefined,
    status: e.status || 'ACTIVE',
    created_at: e.created_at || new Date().toISOString(),
    updated_at: e.updated_at || e.created_at || new Date().toISOString(),
  };
}

export const watchlistsApi = {
  async getWatchlists(params?: {
    category?: string;
    priority?: string;
    search?: string;
    status?: string;
  }): Promise<WatchlistEntity[]> {
    const res = await apiClient.get('/watchlists', {
      params: {
        category: params?.category,
        status: params?.status || 'ACTIVE',
      },
    });
    const list = Array.isArray(res.data) ? res.data : [];
    let items = list.map(normalizeWatchlistEntity);
    if (params?.priority && params.priority !== 'ALL') {
      items = items.filter((w) => w.priority === params.priority);
    }
    if (params?.search) {
      const q = params.search.toUpperCase();
      items = items.filter(
        (w) =>
          w.identifier.toUpperCase().includes(q) ||
          (w.source_ref && w.source_ref.toUpperCase().includes(q))
      );
    }
    return items;
  },

  async createWatchlistEntity(entity: Partial<WatchlistEntity>): Promise<WatchlistEntity> {
    const payload = {
      entity_type: entity.entity_type || 'VEHICLE',
      identifier: entity.identifier || '',
      category: entity.category || 'STOLEN',
      priority: entity.priority || 'HIGH',
      source_ref: entity.source_ref || undefined,
      notes: entity.notes || undefined,
      department_id: entity.department_id || undefined,
      aliases: [],
    };
    const res = await apiClient.post('/watchlists', payload);
    return normalizeWatchlistEntity(res.data);
  },

  async updateWatchlistEntity(id: string, entity: Partial<WatchlistEntity>): Promise<WatchlistEntity> {
    const res = await apiClient.patch(`/watchlists/${id}`, entity);
    return normalizeWatchlistEntity(res.data);
  },

  async deleteWatchlistEntity(id: string): Promise<void> {
    await apiClient.delete(`/watchlists/${id}`);
  },

  async matchCandidateDiagnostic(data: {
    identifier: string;
    ocr_confidence?: number;
    category?: string;
  }): Promise<{ matches: WatchlistMatchCandidate[]; best_match?: WatchlistMatchCandidate; raw?: any }> {
    const res = await apiClient.post('/watchlists/match', {
      identifier: data.identifier,
      confidence: data.ocr_confidence || 0.90,
    });

    const d = res.data;
    const matches: WatchlistMatchCandidate[] = [];

    if (d.matched && d.entity) {
      const matchCandidate: WatchlistMatchCandidate = {
        entity_id: d.entity.id,
        identifier: d.entity.identifier,
        category: d.entity.category,
        priority: d.entity.priority,
        similarity_score: d.similarity_score,
        ocr_confidence: data.ocr_confidence || 0.90,
        is_strong_match: d.similarity_score >= 0.85,
        requires_review: d.requires_review ?? false,
        reason: `${d.match_type}: ${(d.similarity_score * 100).toFixed(1)}% score`,
      };
      matches.push(matchCandidate);
      return { matches, best_match: matchCandidate, raw: d };
    }

    return { matches: [], raw: d };
  },
};
