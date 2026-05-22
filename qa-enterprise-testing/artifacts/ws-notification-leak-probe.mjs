#!/usr/bin/env node

const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
const wsUrl = process.env.WS_URL || 'ws://localhost:8080/ws/websocket';
const subscriberToken = process.env.SUBSCRIBER_TOKEN;
const senderToken = process.env.SENDER_TOKEN;
const targetUsername = process.env.TARGET_USERNAME;
const targetUserId = process.env.TARGET_USER_ID;

if (!subscriberToken || !senderToken || !targetUsername || !targetUserId) {
  console.error('SUBSCRIBER_TOKEN, SENDER_TOKEN, TARGET_USERNAME, and TARGET_USER_ID are required');
  process.exit(2);
}

function frame(command, headers = {}, body = '') {
  return [command, ...Object.entries(headers).map(([key, value]) => `${key}:${value}`), '', body].join('\n') + '\0';
}

const messages = [];
const destination = `/topic/notifications/${targetUsername}`;
const marker = `QA-WS-LEAK-${Date.now()}`;
const socket = new WebSocket(wsUrl);
let connected = false;
let sent = false;

socket.addEventListener('open', () => {
  socket.send(frame('CONNECT', {
    'accept-version': '1.2',
    host: 'localhost',
    Authorization: `Bearer ${subscriberToken}`,
  }));
});

socket.addEventListener('message', async (event) => {
  const data = String(event.data);
  messages.push(data.replace(subscriberToken, '[SUBSCRIBER_TOKEN]').replace(senderToken, '[SENDER_TOKEN]').slice(0, 1000));

  if (data.includes('CONNECTED') && !connected) {
    connected = true;
    socket.send(frame('SUBSCRIBE', {
      id: 'leak-sub',
      destination,
    }));

    setTimeout(async () => {
      if (sent) return;
      sent = true;
      const url = new URL(`${baseUrl}/api/v1/notifications/send/${targetUserId}`);
      url.searchParams.set('title', marker);
      url.searchParams.set('message', 'Cross-user websocket notification probe');
      await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${senderToken}`,
        },
        signal: AbortSignal.timeout(10000),
      });
    }, 300);
  }
});

socket.addEventListener('error', (event) => {
  messages.push(`error:${event.message || event.type}`);
});

setTimeout(() => {
  try {
    socket.close();
  } catch {
    // Best-effort close.
  }
  console.log(JSON.stringify({
    wsUrl,
    destination,
    connected,
    notificationSent: sent,
    marker,
    leaked: messages.some((message) => message.includes(marker)),
    messages,
  }, null, 2));
}, Number(process.env.DURATION_MS || 4000));
