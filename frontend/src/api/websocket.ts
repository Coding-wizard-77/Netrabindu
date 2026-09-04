import { WebSocketMessage } from '../types';

type MessageHandler = (message: WebSocketMessage) => void;

class RealtimeWebSocketManager {
  private ws: WebSocket | null = null;
  private pingInterval: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 15;
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private isConnecting = false;
  private isExplicitlyClosed = false;

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const token = localStorage.getItem('netrabindu_access_token') || 'anonymous_token';
    const baseUrl = import.meta.env.VITE_WS_URL || `${protocol}//${host}/ws/alerts`;
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;
    this.isConnecting = true;
    this.isExplicitlyClosed = false;

    try {
      const url = this.getWebSocketUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[NetraBindu WS] Connected to Real-time Command Bus (/ws/alerts)');
        this.reconnectAttempts = 0;
        this.isConnecting = false;

        // Start ping keep-alive
        this.startPingKeepAlive();

        this.broadcast({
          topic: 'system',
          type: 'CAMERA_HEALTH',
          timestamp: new Date().toISOString(),
          payload: { status: 'CONNECTED' },
        });
      };

      this.ws.onmessage = (event) => {
        try {
          if (event.data === '{"type": "pong"}' || event.data === 'pong') {
            return; // keep-alive response
          }

          const raw = JSON.parse(event.data);

          if (raw.type === 'ALERT_NEW' && raw.data) {
            const normalizedAlert = {
              ...raw.data,
              target_identifier: raw.data.entity_identifier || raw.data.target_identifier || 'UNKNOWN',
              detected_identifier: raw.data.entity_identifier || raw.data.detected_identifier || 'UNKNOWN',
              watchlist_category: raw.data.watchlist_category || 'SUSPECT_WATCHLIST',
              location: {
                lat: raw.data.latitude || 23.0225,
                lon: raw.data.longitude || 72.5714,
              },
              occurred_at: raw.data.occurred_at || raw.data.created_at,
              operator_notes: raw.data.notes,
              assigned_unit: raw.data.dispatch_unit,
            };

            const wsMessage: WebSocketMessage = {
              topic: 'alerts',
              type: 'ALERT',
              timestamp: new Date().toISOString(),
              payload: normalizedAlert,
            };

            this.dispatch(wsMessage);

            // Also dispatch as detection for live feed streams
            this.dispatch({
              topic: 'anpr.events',
              type: 'DETECTION',
              timestamp: new Date().toISOString(),
              payload: {
                event_id: normalizedAlert.event_id || normalizedAlert.id,
                event_type: 'ANPR',
                camera_id: normalizedAlert.camera_id || 'cam-01',
                camera_name: normalizedAlert.camera_name,
                occurred_at: normalizedAlert.occurred_at,
                identifier: {
                  type: 'vehicle_plate',
                  raw: normalizedAlert.detected_identifier,
                  normalized: normalizedAlert.detected_identifier,
                  confidence: 0.98,
                },
                location: normalizedAlert.location,
                evidence: normalizedAlert.evidence || {},
                pipeline: {
                  node_id: 'node-sg-01',
                  model_version: 'yolo-v11-anpr-v2',
                  quality_state: 'Critical',
                },
              },
            });
          } else if (raw.type === 'ALERT_UPDATE' && raw.data) {
            this.dispatch({
              topic: 'alerts',
              type: 'ALERT',
              timestamp: new Date().toISOString(),
              payload: raw.data,
            });
          } else if (raw.topic && raw.payload) {
            this.dispatch(raw as WebSocketMessage);
          } else {
            this.dispatch({
              topic: raw.type || 'events',
              type: raw.type || 'DETECTION',
              timestamp: new Date().toISOString(),
              payload: raw.data || raw,
            });
          }
        } catch (e) {
          console.error('[NetraBindu WS] Parse error:', e);
        }
      };

      this.ws.onclose = () => {
        this.stopPingKeepAlive();
        this.isConnecting = false;
        if (!this.isExplicitlyClosed) {
          console.warn('[NetraBindu WS] Disconnected. Reconnecting...');
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        console.error('[NetraBindu WS] Error:', err);
        this.ws?.close();
      };
    } catch (err) {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private startPingKeepAlive() {
    this.stopPingKeepAlive();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, 15000);
  }

  private stopPingKeepAlive() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[NetraBindu WS] Max reconnect attempts reached');
      return;
    }
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 15000);
    setTimeout(() => this.connect(), delay);
  }

  subscribe(topic: string, handler: MessageHandler) {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    this.listeners.get(topic)!.add(handler);

    // Auto-connect on subscription if not connected
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.connect();
    }

    return () => {
      this.listeners.get(topic)?.delete(handler);
    };
  }

  private dispatch(message: WebSocketMessage) {
    // Specific topic listeners
    const topicListeners = this.listeners.get(message.topic);
    if (topicListeners) {
      topicListeners.forEach((handler) => handler(message));
    }
    // Wildcard listeners
    const allListeners = this.listeners.get('*');
    if (allListeners) {
      allListeners.forEach((handler) => handler(message));
    }
  }

  private broadcast(message: WebSocketMessage) {
    this.dispatch(message);
  }

  disconnect() {
    this.isExplicitlyClosed = true;
    this.stopPingKeepAlive();
    this.ws?.close();
  }
}

export const wsManager = new RealtimeWebSocketManager();
