#!/usr/bin/env node

const token = process.env.STUDENT_TOKEN;
const url = process.env.WS_URL || 'ws://localhost:8080/ws/websocket';
const connections = Number(process.env.CONNECTIONS || 100);
const durationMs = Number(process.env.DURATION_MS || 5000);

if (!token) {
  console.error('STUDENT_TOKEN is required');
  process.exit(2);
}

let opened = 0;
let connected = 0;
let errors = 0;
let closed = 0;
const latencies = [];
const sockets = [];

function frame(command, headers = {}, body = '') {
  return [command, ...Object.entries(headers).map(([key, value]) => `${key}:${value}`), '', body].join('\n') + '\0';
}

for (let i = 0; i < connections; i += 1) {
  const startedAt = Date.now();
  const socket = new WebSocket(url);
  sockets.push(socket);

  socket.addEventListener('open', () => {
    opened += 1;
    socket.send(frame('CONNECT', {
      'accept-version': '1.2',
      host: 'localhost',
      Authorization: `Bearer ${token}`,
    }));
  });

  socket.addEventListener('message', (event) => {
    const data = String(event.data);
    if (data.includes('CONNECTED')) {
      connected += 1;
      latencies.push(Date.now() - startedAt);
      socket.send(frame('SUBSCRIBE', {
        id: `sub-${i}`,
        destination: '/user/queue/notifications',
      }));
    }
    if (data.includes('ERROR')) {
      errors += 1;
    }
  });

  socket.addEventListener('error', () => {
    errors += 1;
  });

  socket.addEventListener('close', () => {
    closed += 1;
  });
}

setTimeout(() => {
  for (const socket of sockets) {
    try {
      socket.close();
    } catch {
      // Best-effort cleanup for storm probe sockets.
    }
  }
}, durationMs);

setTimeout(() => {
  latencies.sort((a, b) => a - b);
  const percentile = (q) => (
    latencies.length
      ? latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * q))]
      : null
  );

  console.log(JSON.stringify({
    url,
    connections,
    durationMs,
    opened,
    connected,
    errors,
    closed,
    connectLatencyMs: {
      min: latencies[0] ?? null,
      p50: percentile(0.50),
      p95: percentile(0.95),
      p99: percentile(0.99),
      max: latencies[latencies.length - 1] ?? null,
    },
  }, null, 2));
}, durationMs + 1500);
