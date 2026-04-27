/**
 * SYNC ENGINE — Real-time Remote Trigger via Ntfy (HTTP SSE)
 * 100% reliable cross-device communication without WebRTC firewall issues.
 */

const SyncEngine = (() => {
  let listeners = {};
  let isHost = false;
  let pairingCode = null;
  let statusCallback = null;
  let eventSource = null;

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
      // Send to server
      fetch(`https://ntfy.sh/doorprize-v2-${pairingCode}`, {
        method: 'POST',
        body: JSON.stringify(event)
      }).catch(console.error);
    }
  }

  function on(type, handler) { listeners[type] = handler; }
  function off(type) { delete listeners[type]; }
  function setStatusCallback(cb) { statusCallback = cb; }
  function notifyStatus(status, text) { if (statusCallback) statusCallback(status, text); }

  function connectToRoom(code, asHost) {
    if (eventSource) eventSource.close();
    
    eventSource = new EventSource(`https://ntfy.sh/doorprize-v2-${code}/sse`);
    
    eventSource.onopen = () => {
      if (asHost) {
        notifyStatus('ready', code);
        window.dispatchEvent(new CustomEvent('doorprize:pairing_code', { detail: code }));
      }
    };

    eventSource.onerror = () => {
      console.warn("Connection issue, retrying...");
    };

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event === 'message') {
          const payload = JSON.parse(data.message);
          
          // Ignore messages sent by ourselves
          if ((asHost && payload.sender === 'host') || (!asHost && payload.sender === 'remote')) return;
          
          // Handshake logic
          if (asHost && payload.type === 'ping') {
            // Remote says hello, host replies with pong
            window.dispatchEvent(new CustomEvent('doorprize:remote_connected'));
            emit('pong');
            return;
          }
          
          if (!asHost && payload.type === 'pong') {
            // Host confirmed our ping, we are connected!
            notifyStatus('connected', 'Connected to main display');
            window.dispatchEvent(new CustomEvent('doorprize:connected'));
            return;
          }
          
          if (asHost && payload.type === 'action') {
            window.dispatchEvent(new CustomEvent('doorprize:remote_connected'));
          }

          handleIncoming(payload);
        }
      } catch (err) {}
    };
  }

  function initHost() {
    isHost = true;
    pairingCode = Math.floor(1000 + Math.random() * 9000).toString();
    notifyStatus('connecting', 'Generating pairing code...');
    connectToRoom(pairingCode, true);
  }

  function connectRemote(code) {
    isHost = false;
    pairingCode = code;
    notifyStatus('connecting', 'Connecting...');
    connectToRoom(code, false);
    
    // Send ping every 2 seconds until we receive a pong
    const pingInterval = setInterval(() => {
      if (statusCallback) emit('ping');
    }, 2000);
    
    // Stop pinging once connected
    window.addEventListener('doorprize:connected', () => {
      clearInterval(pingInterval);
    }, { once: true });
  }

  // Fallback signature for old calls
  function init(role) {
    if (role === 'host') initHost();
  }
  
  function getRole() {
    return isHost ? 'host' : 'remote';
  }

  return { init, initHost, connectRemote, emit, on, off, setStatusCallback, getRole };
})();
