/**
 * SYNC ENGINE — Real-time Remote Trigger via PeerJS (WebRTC)
 * Allows cross-device communication via internet without a custom backend.
 */

const SyncEngine = (() => {
  let peer = null;
  let connection = null;
  let listeners = {};
  let isHost = false;
  let pairingCode = null;
  let statusCallback = null;

  function handleIncoming(data) {
    if (!data || !data.type) return;
    const handler = listeners[data.type];
    if (handler) handler(data.payload);
    window.dispatchEvent(new CustomEvent('doorprize:' + data.type, { detail: data.payload }));
  }

  function emit(type, payload = {}) {
    const event = { type, payload, ts: Date.now() };
    if (connection && connection.open) {
      connection.send(event);
    }
    // Also handle locally for host UI updates
    if (isHost) handleIncoming(event);
  }

  function on(type, handler) { listeners[type] = handler; }
  function off(type) { delete listeners[type]; }
  function setStatusCallback(cb) { statusCallback = cb; }
  function notifyStatus(status, text) { if (statusCallback) statusCallback(status, text); }

  function initHost() {
    isHost = true;
    if (typeof Peer === 'undefined') {
      console.warn('PeerJS not loaded. Remote will not work across internet.');
      return;
    }
    
    // Generate 4-digit code
    pairingCode = Math.floor(1000 + Math.random() * 9000).toString();
    const peerId = 'doorprize-v1-' + pairingCode;
    
    notifyStatus('connecting', 'Generating pairing code...');
    
    peer = new Peer(peerId);
    
    peer.on('open', (id) => {
      notifyStatus('ready', pairingCode);
      window.dispatchEvent(new CustomEvent('doorprize:pairing_code', { detail: pairingCode }));
    });

    peer.on('connection', (conn) => {
      connection = conn; // Keep single remote connection
      notifyStatus('connected', 'Remote connected!');
      window.dispatchEvent(new CustomEvent('doorprize:remote_connected'));
      
      conn.on('data', handleIncoming);
      conn.on('close', () => {
        connection = null;
        notifyStatus('ready', pairingCode);
        window.dispatchEvent(new CustomEvent('doorprize:remote_disconnected'));
      });
    });

    peer.on('error', (err) => {
      console.error(err);
      notifyStatus('error', 'Connection error');
    });
  }

  function connectRemote(code) {
    isHost = false;
    if (typeof Peer === 'undefined') return;
    notifyStatus('connecting', 'Connecting to main display...');
    
    peer = new Peer();
    
    peer.on('open', () => {
      const targetId = 'doorprize-v1-' + code;
      connection = peer.connect(targetId, { reliable: true });
      
      connection.on('open', () => {
        notifyStatus('connected', 'Connected to main display');
        window.dispatchEvent(new CustomEvent('doorprize:connected'));
      });

      connection.on('data', handleIncoming);
      
      connection.on('close', () => {
        notifyStatus('error', 'Disconnected from main display');
        window.dispatchEvent(new CustomEvent('doorprize:disconnected'));
      });
    });

    peer.on('error', (err) => {
      console.error(err);
      notifyStatus('error', 'Connection failed');
      window.dispatchEvent(new CustomEvent('doorprize:error'));
    });
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
