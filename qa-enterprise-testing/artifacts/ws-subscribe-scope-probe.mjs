#!/usr/bin/env node

const token = process.env.STUDENT_TOKEN;
const url = process.env.WS_URL || 'ws://localhost:8080/ws/websocket';
const destinations = (process.env.DESTINATIONS || '/topic/school/3,/topic/class/3,/topic/global,/user/queue/notifications')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

if (!token) {
  console.error('STUDENT_TOKEN is required');
  process.exit(2);
}

function frame(command, headers = {}, body = '') {
  return [command, ...Object.entries(headers).map(([key, value]) => `${key}:${value}`), '', body].join('\n') + '\0';
}

const messages = [];
const socket = new WebSocket(url);
let connected = false;

socket.addEventListener('open', () => {
  socket.send(frame('CONNECT', {
    'accept-version': '1.2',
    host: 'localhost',
    Authorization: `Bearer ${token}`,
  }));
});

socket.addEventListener('message', (event) => {
  const data = String(event.data);
  messages.push(data.replace(token, '[TOKEN]').slice(0, 500));
  if (data.includes('CONNECTED') && !connected) {
    connected = true;
    destinations.forEach((destination, index) => {
      socket.send(frame('SUBSCRIBE', {
        id: `sub-${index}`,
        destination,
      }));
    });
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
    url,
    connected,
    destinations,
    messageCount: messages.length,
    messages,
    subscribeErrors: messages.filter((message) => message.includes('ERROR')).length,
  }, null, 2));
}, Number(process.env.DURATION_MS || 3000));
