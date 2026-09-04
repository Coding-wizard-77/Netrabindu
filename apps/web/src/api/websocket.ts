import { WebSocketMessage } from '../types';

type MessageHandler = (message: WebSocketMessage) => void;

class RealtimeWebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private isConnecting = false;
  private isExplicitlyClosed = false;

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.url = import.meta.env.VITE_WS_URL || `${protocol}//${host}/ws/events`;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;
    this.isConnecting = true;
    this.isExplicitlyClosed = false;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[NetraBindu WS] Connected to Real-time Event Bus');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.broadcast({ topic: 'system', type: 'CAMERA_HEALTH', timestamp: new Date().toISOString(), payload: { status: 'CONNECTED' } });
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          this.dispatch(data);
        } catch (e) {
          console.error('[NetraBindu WS] Parse error:', e);
        }
      };

      this.ws.onclose = () => {
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
    this.ws?.close();
  }
}

export const wsManager = new RealtimeWebSocketManager();
