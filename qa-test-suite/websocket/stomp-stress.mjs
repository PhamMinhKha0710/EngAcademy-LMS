#!/usr/bin/env node
const baseWs = process.env.WS_URL || 'ws://localhost:8080/ws/websocket';
const connections = Number(process.env.CONNECTIONS || 25);
const topic = process.env.TOPIC || '/topic/notifications';
const sockets = [];

function frame(command, headers = {}, body = '') {
  const lines = [command, ...Object.entries(headers).map(([k, v]) => `${k}:${v}`), '', body];
  return lines.join('\n') + '\0';
}

for (let i = 0; i < connections; i++) {
  const ws = new WebSocket(baseWs);
  sockets.push(ws);
  ws.addEventListener('open', () => {
    ws.send(frame('CONNECT', { 'accept-version': '1.2', host: 'localhost' }));
    ws.send(frame('SUBSCRIBE', { id: `sub-${i}`, destination: topic }));
  });
  ws.addEventListener('message', (event) => {
    console.log(JSON.stringify({ socket: i, message: String(event.data).slice(0, 120) }));
  });
  ws.addEventListener('error', (error) => {
    console.error(JSON.stringify({ socket: i, error: String(error.message || error) }));
  });
}

setTimeout(() => {
  for (const ws of sockets) {
    try { ws.close(); } catch {}
  }
}, Number(process.env.DURATION_MS || 30000));
