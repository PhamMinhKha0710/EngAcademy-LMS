# Runtime Metrics

## Reachability

- Backend health: `200`.
- OpenAPI: `200`.
- Swagger UI: `200`.
- Actuator: `404`.
- Redis port: `6379` listening.
- MySQL port: `3306` listening.
- Backend Java port: `8080` listening.
- Frontend ports `3000`, `3001`, `5173`, `80`: connection refused.

## API Load

Probe settings: 500 requests per scenario, concurrency 50.

| Scenario | Statuses | p50 | p95 | p99 | Max |
|---|---:|---:|---:|---:|---:|
| health | 500x200 | 21 ms | 56 ms | 80 ms | 83 ms |
| users/me | 500x200 | 104 ms | 176 ms | 211 ms | 235 ms |
| active exams class 1 | 500x200 | 269 ms | 385 ms | 474 ms | 547 ms |
| questions | 500x200 | 724 ms | 905 ms | 1067 ms | 1277 ms |

## WebSocket

- Anonymous STOMP: rejected with `ERROR message: WebSocket authentication token missing`.
- Authenticated 100-connection storm: 100 opened, 100 connected, 0 errors.
- Authenticated connect latency: min 118 ms, p50 171 ms, p95 226 ms, p99 228 ms, max 228 ms.
- Unauthorized topic subscribe probe: no `ERROR` returned for `/topic/school/3`, `/topic/class/3`, `/topic/global`.
