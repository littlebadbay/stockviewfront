import { config } from '../config';

type Listener<T = any> = (data: T) => void;

export interface ReconnectOptions {
  autoConnect?: boolean;
  maxRetries?: number;
  reconnectIntervalMs?: number;
  maxReconnectIntervalMs?: number;
}

export class ReconnectingWebSocketClient {
  private url: string;

  private protocols?: string | string[];

  private ws: WebSocket | null = null;

  private attempts = 0;

  private readonly maxRetries: number;

  private readonly reconnectIntervalMs: number;

  private readonly maxReconnectIntervalMs: number;

  private shouldReconnect = true;

  private openListeners: Listener[] = [];
  private messageListeners: Listener<MessageEvent['data']>[] = [];
  private closeListeners: Listener<CloseEvent>[] = [];
  private errorListeners: Listener<Event>[] = [];

  constructor(url?: string, protocols?: string | string[], opts: ReconnectOptions = {}) {
    this.url = url || config.wsUrl;
    this.protocols = protocols;
    this.maxRetries = opts.maxRetries ?? 10;
    this.reconnectIntervalMs = opts.reconnectIntervalMs ?? 1000;
    this.maxReconnectIntervalMs = opts.maxReconnectIntervalMs ?? 15000;

    if (opts.autoConnect) {
      this.connect();
    }
  }

  connect() {
    if (!this.url) {
      console.warn('ReconnectingWebSocketClient: No URL provided');
      return;
    }
    this.shouldReconnect = true;
    this.ws = new WebSocket(this.url, this.protocols);

    this.ws.onopen = () => {
      this.attempts = 0;
      this.openListeners.forEach((l) => l(undefined));
    };

    this.ws.onmessage = (ev) => {
      this.messageListeners.forEach((l) => l(ev.data));
    };

    this.ws.onclose = (ev) => {
      this.closeListeners.forEach((l) => l(ev));
      if (this.shouldReconnect && (ev.code !== 1000 || ev.wasClean === false)) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (ev) => {
      this.errorListeners.forEach((l) => l(ev));
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.ws) this.ws.close(1000, 'client disconnect');
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('socket not connected');
    }
    this.ws.send(data);
  }

  onOpen(cb: Listener) {
    this.openListeners.push(cb);
    return () => (this.openListeners = this.openListeners.filter((l) => l !== cb));
  }
  onMessage(cb: Listener<MessageEvent['data']>) {
    this.messageListeners.push(cb);
    return () => (this.messageListeners = this.messageListeners.filter((l) => l !== cb));
  }
  onClose(cb: Listener<CloseEvent>) {
    this.closeListeners.push(cb);
    return () => (this.closeListeners = this.closeListeners.filter((l) => l !== cb));
  }
  onError(cb: Listener<Event>) {
    this.errorListeners.push(cb);
    return () => (this.errorListeners = this.errorListeners.filter((l) => l !== cb));
  }

  private scheduleReconnect() {
    if (this.attempts >= this.maxRetries) return;
    this.attempts += 1;
    const delay = Math.min(
      this.reconnectIntervalMs * 2 ** (this.attempts - 1),
      this.maxReconnectIntervalMs
    );
    setTimeout(() => this.connect(), delay);
  }
}
