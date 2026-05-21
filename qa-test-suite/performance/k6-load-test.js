import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    api_smoke: { executor: 'constant-vus', vus: 10, duration: '1m' },
    leaderboard_burst: { executor: 'ramping-arrival-rate', startRate: 5, timeUnit: '1s', preAllocatedVUs: 20, stages: [
      { target: 20, duration: '30s' },
      { target: 50, duration: '30s' },
      { target: 5, duration: '30s' },
    ] },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
  },
};

const baseUrl = __ENV.BASE_URL || 'http://localhost:8080';

export default function () {
  const endpoints = [
    '/api/v1/auth/health',
    '/api/v1/public/stats',
    '/api/v1/leaderboard/top?limit=10',
    '/api/v1/leaderboard/coins?page=0&size=10',
  ];
  for (const endpoint of endpoints) {
    const res = http.get(baseUrl + endpoint);
    check(res, {
      'status below 500': (r) => r.status < 500,
      'no Java stack trace': (r) => !String(r.body).includes('java.lang.'),
    });
  }
  sleep(1);
}
