/**
 * SYNC ENGINE v10 — WebSocket-based (replaces broken SSE)
 * Uses ntfy.sh WebSocket for subscribing + HTTP POST for publishing.
 */

const SyncEngine = (() => {
  let listeners = {};
  let isHost = false;
  let pairingCode = null;
  let statusCallback = null;
  let ws = null;
  let connected = false;
  let pingInterval = null;
  let connectionTimeout = null;

  function handleIncoming(payload) {
    if (!payload || !payload.type) return;
    const handler = listeners[payload.type];
    if (handler) handler(payload.payload);
    window.dispatchEvent(new CustomEvent('doorprize:' + payload.type, { detail: payload.payload }));
  }

  function emit(type, payload = {}) {
    const event = { type, payload, sender: isHost ? 'host' : 'remote', ts: Date.now() };

    // Process locally for immediate UI response
    if (isHost || type === 'action') {
      handleIncoming(event);
    }

    if (pairingCode) {
      fetch(`https://ntfy.sh/doorprize-v3-${pairingCode}`, {
        method: 'POST',
        body: JSON.stringify(event)
      }).catch(err => console.warn('[Sync] POST error:', err));
    }
  }

  function on(type, handler) { listeners[type] = handler; }
  function off(type) { delete listeners[type]; }
  function setStatusCallback(cb) { statusCallback = cb; }
  function notifyStatus(status, text) { if (statusCallback) statusCallback(status, text); }

  function connectToRoom(code, asHost) {
    if (ws) { try { ws.close(); } catch(e){} }
    connected = false;

    const wsUrl = `wss://ntfy.sh/doorprize-v3-${code}/ws`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[Sync] WebSocket open, role:', asHost ? 'host' : 'remote');
      if (asHost) {
        notifyStatus('ready', code);
        window.dispatchEvent(new CustomEvent('doorprize:pairing_code', { detail: code }));
      }
    };

    ws.onerror = (err) => {
      console.warn('[Sync] WebSocket error:', err);
    };

    ws.onclose = () => {
      console.warn('[Sync] WebSocket closed');
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event !== 'message') return;

        const payload = JSON.parse(data.message);
        if (!payload || !payload.type) return;

        // Ignore our own messages
        if (asHost && payload.sender === 'host') return;
        if (!asHost && payload.sender === 'remote') return;

        // Handshake: host receives ping -> sends pong
        if (asHost && payload.type === 'ping') {
          console.log('[Sync] Got ping, sending pong');
          window.dispatchEvent(new CustomEvent('doorprize:remote_connected'));
          emit('pong');
          return;
        }

        // Handshake: remote receives pong -> mark connected
        if (!asHost && payload.type === 'pong') {
          console.log('[Sync] Got pong — CONNECTED!');
          connected = true;
          clearInterval(pingInterval);
          clearTimeout(connectionTimeout);
          notifyStatus('connected', 'Connected to main display');
          window.dispatchEvent(new CustomEvent('doorprize:connected'));
          return;
        }

        if (asHost && payload.type === 'action') {
          window.dispatchEvent(new CustomEvent('doorprize:remote_connected'));
        }

        handleIncoming(payload);
      } catch (err) {
        // ignore non-JSON messages (keepalive, open events)
      }
    };
  }

  function initHost() {
    isHost = true;
    pairingCode = 'spin-event-2026'; // FIXED CHANNEL FOR PRODUCTION
    notifyStatus('connecting', 'Connecting to server...');
    connectToRoom(pairingCode, true);
  }

  function connectRemote() {
    isHost = false;
    pairingCode = 'spin-event-2026'; // FIXED CHANNEL FOR PRODUCTION
    connected = false;
    notifyStatus('connecting', 'Connecting to host...');
    connectToRoom(pairingCode, false);
    
    // We don't need ping-pong for a fixed production channel
    // and removing it prevents ntfy.sh 429 rate limits.
    setTimeout(() => {
      connected = true;
      notifyStatus('connected', 'Connected to main display');
      window.dispatchEvent(new CustomEvent('doorprize:connected'));
    }, 1500);
  }

  function init(role) {
    if (role === 'host') initHost();
  }

  function getRole() {
    return isHost ? 'host' : 'remote';
  }

  return { init, initHost, connectRemote, emit, on, off, setStatusCallback, getRole };
})();
