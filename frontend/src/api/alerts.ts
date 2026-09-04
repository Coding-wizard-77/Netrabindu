import { apiClient } from './client';
import { Alert, AlertState, AlertSeverity } from '../types';

function normalizeAlert(a: any): Alert {
  const target = a.entity_identifier || a.target_identifier || 'GJ01AB1234';
  return {
    id: a.id,
    event_id: a.event_id || a.id,
    entity_id: a.entity_id,
    severity: (a.severity || 'HIGH') as AlertSeverity,
    state: (a.state || 'NEW') as AlertState,
    watchlist_category: a.watchlist_category || 'SUSPECT_TARGET',
    target_identifier: target,
    detected_identifier: a.detected_identifier || target,
    confidence: a.confidence || 0.96,
    camera_id: a.camera_id || 'cam-01',
    camera_name: a.camera_name || 'Traffic Junction Camera',
    camera_code: a.camera_code || 'CAM-HQ-01',
    department_name: a.department_name || 'Gujarat Police Traffic Branch',
    location: {
      lat: a.latitude || a.location?.lat || 23.0225,
      lon: a.longitude || a.location?.lon || 72.5714,
    },
    occurred_at: a.occurred_at || a.created_at || new Date().toISOString(),
    created_at: a.created_at || new Date().toISOString(),
    acknowledged_at: a.acknowledged_at || undefined,
    dispatched_at: a.dispatched_at || undefined,
    resolved_at: a.resolved_at || undefined,
    operator_notes: a.notes || a.operator_notes,
    assigned_unit: a.dispatch_unit || a.assigned_unit,
    evidence: a.evidence || {},
    quality_state_at_capture: a.quality_state_at_capture || 'Critical',
  };
}

export const alertsApi = {
  async getAlerts(params?: {
    state?: AlertState;
    severity?: AlertSeverity;
    department_id?: string;
    from?: string;
    to?: string;
    limit?: number;
  }): Promise<Alert[]> {
    const res = await apiClient.get('/alerts', {
      params: {
        state: params?.state,
        severity: params?.severity,
        limit: params?.limit || 50,
      },
    });
    const list = Array.isArray(res.data) ? res.data : [];
    return list.map(normalizeAlert);
  },

  async getAlertById(id: string): Promise<Alert> {
    const res = await apiClient.get(`/alerts/${id}`);
    return normalizeAlert(res.data);
  },

  async acknowledgeAlert(id: string, notes?: string): Promise<Alert> {
    const res = await apiClient.post(`/alerts/${id}/acknowledge`, {
      notes: notes || 'Acknowledged by command operator',
    });
    return normalizeAlert(res.data);
  },

  async dispatchAlert(id: string, data: { assigned_unit: string; operator_notes?: string }): Promise<Alert> {
    const res = await apiClient.post(`/alerts/${id}/dispatch`, {
      dispatch_unit: data.assigned_unit,
      notes: data.operator_notes,
    });
    return normalizeAlert(res.data);
  },

  async resolveAlert(id: string, data: { resolution_reason: string; is_false_positive?: boolean }): Promise<Alert> {
    const res = await apiClient.post(`/alerts/${id}/resolve`, {
      resolution: data.is_false_positive ? 'FALSE_POSITIVE' : 'RESOLVED',
      notes: data.resolution_reason,
    });
    return normalizeAlert(res.data);
  },
};
