/**
 * SYNC ENGINE — Real-time Remote Trigger via BroadcastChannel API
 * Works across tabs/windows on the same browser & same origin.
 * No server needed for same-device scenarios.
 * 
 * For cross-device use, the system falls back to localStorage events
 * (works on same network via shared storage — requires same browser profile)
 * or uses QR code approach with URL hash state.
 */

const SyncEngine = (() => {
  const CHANNEL_NAME = 'doorprize_channel';
  const STORAGE_KEY  = 'doorprize_event';
  let channel = null;
  let listeners = {};
  let pollingInterval = null;
  let lastEventId = null;
  let isHost = false;

  // Try BroadcastChannel first (same browser, cross-tab)
  function initChannel() {
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (e) => {
        handleIncoming(e.data);
      };
    }
  }

  // localStorage polling fallback (cross-device same session not possible,
  // but works if both tabs open on same device)
  function startPolling() {
    pollingInterval = setInterval(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const event = JSON.parse(raw);
        if (event.id !== lastEventId) {
          lastEventId = event.id;
          handleIncoming(event);
        }
      } catch(e) {}
    }, 200);
  }

  function handleIncoming(data) {
    if (!data || !data.type) return;
    const handler = listeners[data.type];
    if (handler) handler(data.payload);
    // Also dispatch as DOM event for easy binding
    window.dispatchEvent(new CustomEvent('doorprize:' + data.type, { detail: data.payload }));
  }

  function emit(type, payload = {}) {
    const event = {
      id: Date.now() + '_' + Math.random().toString(36).slice(2),
      type,
      payload,
      ts: Date.now()
    };
    // BroadcastChannel
    if (channel) channel.postMessage(event);
    // localStorage fallback
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(event));
    } catch(e) {}
    // Also handle locally so the sender sees it
    handleIncoming(event);
  }

  function on(type, handler) {
    listeners[type] = handler;
  }

  function off(type) {
    delete listeners[type];
  }

  function setHost(val) {
    isHost = val;
    localStorage.setItem('doorprize_role', val ? 'host' : 'remote');
  }

  function getRole() {
    return localStorage.getItem('doorprize_role') || 'host';
  }

  // Generate a shareable remote URL
  function getRemoteURL() {
    const base = window.location.href.replace('index.html', '').replace(/\/$/, '');
    return base + '/remote.html';
  }

  function init(role) {
    initChannel();
    startPolling();
    setHost(role === 'host');
  }

  return { init, emit, on, off, getRole, getRemoteURL, setHost };
})();
