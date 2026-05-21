#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
const now = new Date().toISOString();

const dirs = [
  'discovered-bugs',
  'security-findings',
  'production-risks',
  'regression',
  'api',
  'websocket',
  'concurrency',
  'anti-cheat',
  'sm2',
  'performance',
  'reports',
  'automation',
  'docs',
  'sql',
];

for (const dir of dirs) {
  mkdirSync(join(root, dir), { recursive: true });
}

const fallbackOperations = [
  ['GET', '/api/v1/auth/health', 'Authentication'],
  ['POST', '/api/v1/auth/login', 'Authentication'],
  ['POST', '/api/v1/auth/register', 'Authentication'],
  ['POST', '/api/v1/auth/refresh-token', 'Authentication'],
  ['POST', '/api/v1/auth/forgot-password', 'Authentication'],
  ['POST', '/api/v1/auth/reset-password', 'Authentication'],
  ['GET', '/api/v1/users/me', 'Users'],
  ['GET', '/api/v1/users/{id}', 'Users'],
  ['GET', '/api/v1/users', 'Users'],
  ['POST', '/api/v1/users', 'Users'],
  ['PUT', '/api/v1/users/{id}', 'Users'],
  ['DELETE', '/api/v1/users/{id}', 'Users'],
  ['GET', '/api/v1/schools', 'School Management'],
  ['GET', '/api/v1/schools/{id}', 'School Management'],
  ['POST', '/api/v1/schools', 'School Management'],
  ['PUT', '/api/v1/schools/{id}', 'School Management'],
  ['DELETE', '/api/v1/schools/{id}', 'School Management'],
  ['GET', '/api/v1/classes', 'ClassRoom Management'],
  ['GET', '/api/v1/classes/{id}', 'ClassRoom Management'],
  ['GET', '/api/v1/classes/school/{schoolId}', 'ClassRoom Management'],
  ['GET', '/api/v1/classes/teacher/{teacherId}', 'ClassRoom Management'],
  ['GET', '/api/v1/classes/student/{studentId}', 'ClassRoom Management'],
  ['POST', '/api/v1/classes', 'ClassRoom Management'],
  ['PUT', '/api/v1/classes/{id}', 'ClassRoom Management'],
  ['POST', '/api/v1/classes/{classId}/teacher/{teacherId}', 'ClassRoom Management'],
  ['POST', '/api/v1/classes/{classId}/students/{studentId}', 'ClassRoom Management'],
  ['DELETE', '/api/v1/classes/{classId}/students/{studentId}', 'ClassRoom Management'],
  ['GET', '/api/v1/classes/{classId}/students', 'ClassRoom Management'],
  ['GET', '/api/v1/classes/{classId}/students/search', 'ClassRoom Management'],
  ['GET', '/api/v1/exams', 'Exam Management'],
  ['GET', '/api/v1/exams/{id}', 'Exam Management'],
  ['GET', '/api/v1/exams/{id}/take', 'Exam Management'],
  ['GET', '/api/v1/exams/class/{classId}', 'Exam Management'],
  ['GET', '/api/v1/exams/class/{classId}/active', 'Exam Management'],
  ['GET', '/api/v1/exams/teacher/{teacherId}', 'Exam Management'],
  ['POST', '/api/v1/exams', 'Exam Management'],
  ['PUT', '/api/v1/exams/{id}', 'Exam Management'],
  ['POST', '/api/v1/exams/{id}/publish', 'Exam Management'],
  ['POST', '/api/v1/exams/{id}/close', 'Exam Management'],
  ['POST', '/api/v1/exams/{id}/publish-scores', 'Exam Management'],
  ['POST', '/api/v1/exams/submit', 'Exam Management'],
  ['POST', '/api/v1/exams/{examId}/start', 'Exam Management'],
  ['POST', '/api/v1/exams/{examId}/anti-cheat-event', 'Exam Management'],
  ['POST', '/api/v1/exams/{examId}/submit-anticheat', 'Exam Management'],
  ['GET', '/api/v1/exams/{id}/results', 'Exam Management'],
  ['GET', '/api/v1/exams/{id}/my-result', 'Exam Management'],
  ['GET', '/api/v1/exams/results/{examResultId}/anti-cheat-events', 'Exam Management'],
  ['GET', '/api/v1/srs/due-today', 'SRS'],
  ['POST', '/api/v1/srs/review', 'SRS'],
  ['GET', '/api/v1/leaderboard/top', 'Leaderboard'],
  ['GET', '/api/v1/leaderboard/coins', 'Leaderboard'],
  ['GET', '/api/v1/leaderboard/global', 'Leaderboard'],
  ['GET', '/api/v1/leaderboard/users/{userId}', 'Leaderboard'],
  ['GET', '/api/v1/notifications/me', 'Notifications'],
  ['POST', '/api/v1/notifications/broadcast', 'Notifications'],
  ['GET', '/api/v1/lessons', 'Lessons'],
  ['GET', '/api/v1/lessons/{id}', 'Lessons'],
  ['GET', '/api/v1/questions', 'Question Management'],
  ['GET', '/api/v1/questions/{id}', 'Question Management'],
  ['GET', '/api/v1/vocabulary/{id}', 'Vocabulary'],
  ['GET', '/api/v1/vocabulary/lesson/{lessonId}', 'Vocabulary'],
  ['POST', '/api/v1/vocabulary/review', 'Vocabulary'],
  ['GET', '/api/v1/progress/me', 'Progress'],
  ['POST', '/api/v1/progress/me/lesson/{lessonId}', 'Progress'],
  ['POST', '/api/v1/events/batch', 'Events'],
  ['GET', '/api/v1/placement/question', 'Placement'],
  ['POST', '/api/v1/placement/answer', 'Placement'],
  ['GET', '/api/v1/badges/me', 'Badges'],
  ['GET', '/api/v1/public/stats', 'Public'],
];

const roles = [
  { name: 'anonymous', auth: 'none', expectedBoundary: '401 or public-only response' },
  { name: 'admin', auth: 'ROLE_ADMIN token', expectedBoundary: 'admin-only access allowed, tenant checks still enforced' },
  { name: 'school_manager', auth: 'ROLE_SCHOOL token', expectedBoundary: 'same-school data only' },
  { name: 'teacher_owner', auth: 'ROLE_TEACHER token', expectedBoundary: 'assigned teacher resources only' },
  { name: 'student_self', auth: 'ROLE_STUDENT token', expectedBoundary: 'own student resources only' },
  { name: 'student_peer', auth: 'ROLE_STUDENT token for another seeded student', expectedBoundary: 'peer data forbidden' },
  { name: 'tampered_jwt', auth: 'corrupted bearer token', expectedBoundary: '401 without fallback identity' },
];

const payloadProfiles = [
  ['positive_minimal', 'Small valid payload or valid query parameters for the operation'],
  ['positive_full', 'All documented fields set, including optional fields and pagination'],
  ['missing_auth', 'No Authorization header on protected route'],
  ['wrong_role', 'Valid token with insufficient role for method security'],
  ['cross_tenant_id', 'Use another school/class/student/exam identifier'],
  ['wrong_owner_id', 'Use a resource owned by another user in the same tenant'],
  ['negative_id', 'Path or query id = -1'],
  ['zero_id', 'Path or query id = 0'],
  ['large_id', 'Path or query id = 9223372036854775807'],
  ['missing_required_field', 'Remove one required body field'],
  ['null_required_field', 'Set one required field to null'],
  ['empty_string_field', 'Set text fields to empty strings'],
  ['oversized_string_field', 'Set text fields to 8192 characters'],
  ['unicode_boundary', 'Use Vietnamese accents, emoji-like surrogate pairs, RTL markers, and combining marks'],
  ['sql_injection_string', "Use payload values like ' OR '1'='1 and stacked-comment variants"],
  ['xss_html_string', 'Use script, svg/onload, img/onerror, and markdown link payloads'],
  ['type_confusion', 'Send array/object where scalar is expected and scalar where array is expected'],
  ['malformed_json', 'Truncated JSON body with application/json'],
  ['duplicate_submit', 'Repeat the same write request twice'],
  ['replay_after_delay', 'Replay a previously successful request after 5 seconds'],
  ['out_of_order_sequence', 'Call submit/complete before start/create'],
  ['stale_version', 'Reuse stale client state or stale examResultId after a state change'],
  ['concurrency_2', 'Two parallel requests against the same resource'],
  ['concurrency_20', 'Twenty parallel requests against the same resource'],
  ['timeout_abuse', 'Hold the request until near client timeout and retry'],
  ['pagination_extreme', 'page=2147483647 and size=100000'],
  ['sort_injection', 'sort field contains comma chains, SQL-like text, and unknown properties'],
  ['cache_probe', 'Compare immediate repeated reads around a write for stale data'],
  ['csrf_cross_origin', 'Credentialed request from untrusted origin simulation'],
  ['header_spoofing', 'Spoof X-Forwarded-For, X-Real-IP, Host, and Origin'],
];

const threatByModule = {
  Authentication: ['jwt_tamper', 'rate_limit_bypass', 'default_credentials', 'refresh_replay'],
  Users: ['idor', 'privilege_escalation', 'mass_assignment', 'tenant_leak'],
  'School Management': ['multi_school_isolation', 'tenant_enum', 'soft_delete_bypass'],
  'ClassRoom Management': ['classroom_hijack', 'student_membership_idor', 'teacher_scope_bypass'],
  'Exam Management': ['exam_leakage', 'anti_cheat_bypass', 'duplicate_submit', 'late_submit', 'answer_tamper'],
  SRS: ['sm2_quality_boundary', 'optimistic_lock_conflict', 'review_replay', 'timezone_drift'],
  Leaderboard: ['public_pii', 'stale_cache', 'rank_desync', 'limit_abuse'],
  Notifications: ['broadcast_abuse', 'websocket_desync', 'notification_duplication'],
  Vocabulary: ['review_replay', 'content_injection', 'resource_enum'],
  Progress: ['progress_forgery', 'percentage_boundary', 'quest_duplication'],
  Events: ['event_flood', 'fake_event', 'batch_overflow'],
  Placement: ['session_tamper', 'adaptive_path_bypass', 'answer_replay'],
  Badges: ['duplicate_award', 'achievement_forgery', 'idempotency_gap'],
  Public: ['excessive_public_data', 'cache_staleness'],
};

function inferModule(path, tag) {
  if (tag) return tag;
  if (path.includes('/auth')) return 'Authentication';
  if (path.includes('/exam')) return 'Exam Management';
  if (path.includes('/srs')) return 'SRS';
  if (path.includes('/leaderboard')) return 'Leaderboard';
  if (path.includes('/classes')) return 'ClassRoom Management';
  if (path.includes('/schools')) return 'School Management';
  if (path.includes('/notifications')) return 'Notifications';
  return 'API';
}

async function loadOpenApi() {
  try {
    const response = await fetch(`${baseUrl}/v3/api-docs`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`OpenAPI returned ${response.status}`);
    const openapi = await response.json();
    writeJson('reports/openapi-live.json', openapi);
    return openapi;
  } catch (error) {
    return { __fallbackReason: String(error), paths: {} };
  }
}

function getOperations(openapi) {
  const methods = new Set(['get', 'post', 'put', 'patch', 'delete']);
  const operations = [];
  for (const [path, pathItem] of Object.entries(openapi.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem || {})) {
      if (!methods.has(method)) continue;
      operations.push({
        method: method.toUpperCase(),
        path,
        module: inferModule(path, operation.tags?.[0]),
        operationId: operation.operationId || `${method}_${path}`,
        summary: operation.summary || '',
      });
    }
  }
  if (operations.length > 0) return operations;
  return fallbackOperations.map(([method, path, module]) => ({
    method,
    path,
    module,
    operationId: `${method}_${path}`,
    summary: 'Fallback route from source scan',
  }));
}

function scenarioId(index) {
  return `QA-SCENARIO-${String(index).padStart(5, '0')}`;
}

function buildScenario(operation, role, profile, index) {
  const threats = threatByModule[operation.module] || ['api_contract', 'input_validation', 'authorization'];
  const threat = threats[index % threats.length];
  const [profileName, profileDescription] = profile;
  const concurrency = profileName.startsWith('concurrency') || profileName.includes('duplicate') || profileName.includes('replay');
  return {
    id: scenarioId(index),
    generatedAt: now,
    module: operation.module,
    method: operation.method,
    path: operation.path,
    operationId: operation.operationId,
    role: role.name,
    authProfile: role.auth,
    payloadProfile: profileName,
    testType: classify(profileName, operation.module),
    threat,
    priority: priorityFor(threat, profileName),
    steps: [
      `Prepare ${role.auth}.`,
      `Call ${operation.method} ${operation.path} using payload profile ${profileName}.`,
      concurrency ? 'Run the request in the specified parallel/replay pattern and collect all status codes.' : 'Capture status code, response schema, response time, and any side effects.',
      'Compare response against authorization, validation, idempotency, and tenant-isolation oracle.',
    ],
    payloadDescription: profileDescription,
    expectedResult: expectedFor(role, profileName, operation),
    oracle: oracleFor(profileName, operation.module),
    dataRisk: dataRiskFor(operation.module),
    concurrencyPattern: concurrency ? profileName : 'single_request',
    automationTarget: automationTargetFor(operation.module),
  };
}

function classify(profileName, module) {
  if (profileName.includes('concurrency') || profileName.includes('duplicate') || profileName.includes('replay')) return 'concurrency';
  if (profileName.includes('sql') || profileName.includes('xss') || profileName.includes('auth') || profileName.includes('role') || profileName.includes('jwt') || profileName.includes('tenant')) return 'security';
  if (module === 'SRS') return 'sm2';
  if (module === 'Exam Management') return 'exam_workflow';
  if (profileName.includes('pagination') || profileName.includes('timeout')) return 'performance';
  return 'api_contract';
}

function priorityFor(threat, profileName) {
  if (/(privilege|idor|tenant|jwt|duplicate_submit|anti_cheat|exam_leakage|optimistic)/.test(threat)) return 'P0';
  if (/(concurrency|replay|oversized|rate_limit|stale)/.test(profileName) || /(rank|cache|public_pii)/.test(threat)) return 'P1';
  return 'P2';
}

function expectedFor(role, profileName, operation) {
  if (role.name === 'anonymous' && !operation.path.includes('/public') && !operation.path.includes('/auth') && !operation.path.includes('/leaderboard')) {
    return '401 Unauthorized with no sensitive response body.';
  }
  if (role.name === 'tampered_jwt') return '401 Unauthorized; no fallback anonymous success on protected operations.';
  if (profileName.includes('cross_tenant') || profileName.includes('wrong_owner')) return '403 Forbidden or tenant-filtered empty response; never data from another principal.';
  if (profileName.includes('malformed') || profileName.includes('missing') || profileName.includes('null') || profileName.includes('type_confusion')) return '400 validation error with no server stack trace.';
  if (profileName.includes('duplicate') || profileName.includes('replay')) return 'Idempotent response or explicit duplicate rejection; no double DB side effects.';
  if (profileName.includes('concurrency')) return 'Exactly one logical state transition; no lost update, duplicate award, duplicate result, or stale cache.';
  return '2xx only when role, payload, ownership, timing, and state are valid.';
}

function oracleFor(profileName, module) {
  if (module === 'SRS') return 'SM-2 quality must remain 0..5, EF >= 1.3, no duplicate same-card review under concurrent replay.';
  if (module === 'Exam Management') return 'Exam state machine must enforce start, ownership, class membership, score publication, and one submission.';
  if (module === 'Leaderboard') return 'Ranks must be tenant-scoped, stable after writes, and not expose hidden users.';
  if (module === 'Notifications') return 'Only intended recipients receive one notification; WebSocket and REST unread counts agree.';
  if (profileName.includes('sql')) return 'No SQL error, no auth bypass, no data broadening.';
  if (profileName.includes('xss')) return 'Payload is stored/returned safely encoded or rejected.';
  return 'Response status, schema, auth boundary, DB side effects, and audit logs match the contract.';
}

function dataRiskFor(module) {
  if (['Users', 'School Management', 'ClassRoom Management', 'Leaderboard'].includes(module)) return 'PII and tenant metadata';
  if (module === 'Exam Management') return 'exam content, scores, anti-cheat evidence';
  if (module === 'SRS') return 'personal learning schedule and review history';
  return 'application data';
}

function automationTargetFor(module) {
  if (module === 'Exam Management') return 'api + anti-cheat + concurrency';
  if (module === 'SRS') return 'api + sm2 + concurrency';
  if (module === 'Notifications') return 'api + websocket';
  if (module === 'Leaderboard') return 'api + performance + redis consistency';
  return 'api';
}

function buildFocusedScenarios(startIndex) {
  const focused = [];
  let index = startIndex;
  const antiCheatEvents = ['TAB_SWITCH', 'COPY', 'PASTE', 'RIGHT_CLICK', 'DEV_TOOLS', 'BLUR', 'FULLSCREEN_EXIT', 'RECONNECT', 'UNKNOWN_FAKE_EVENT'];
  const antiCheatPatterns = ['spam_1', 'spam_10', 'spam_100', 'delayed_packet', 'future_timestamp', 'past_timestamp', 'wrong_exam_path', 'tampered_exam_result_id', 'after_submit'];
  for (const eventType of antiCheatEvents) {
    for (const pattern of antiCheatPatterns) {
      focused.push({
        id: scenarioId(index++),
        generatedAt: now,
        module: 'Anti-Cheat',
        method: 'POST',
        path: '/api/v1/exams/{examId}/anti-cheat-event',
        role: 'student_self',
        testType: 'anti_cheat_attack',
        threat: 'anti_cheat_bypass',
        priority: 'P0',
        eventType,
        attackPattern: pattern,
        steps: [
          'Start an active exam and capture examResultId.',
          `Send anti-cheat event ${eventType} with pattern ${pattern}.`,
          'Compare violation count, audit row, and submission flag behavior.',
        ],
        expectedResult: 'Only whitelisted events for the authenticated active exam session are accepted once and counted consistently.',
        oracle: 'Path examId, body examResultId, authenticated user, event type, timestamp, and submitted state must all agree.',
        automationTarget: 'anti-cheat',
      });
    }
  }

  for (const quality of [-10, -1, 0, 1, 2, 3, 4, 5, 6, 10, 999]) {
    for (const pattern of ['single', 'duplicate', 'parallel_2', 'parallel_20', 'parallel_100', 'stale_due_date', 'timezone_boundary']) {
      focused.push({
        id: scenarioId(index++),
        generatedAt: now,
        module: 'SRS',
        method: 'POST',
        path: '/api/v1/srs/review',
        role: 'student_self',
        testType: 'sm2_boundary',
        threat: 'optimistic_lock_conflict',
        priority: quality < 0 || quality > 5 || pattern.startsWith('parallel') ? 'P0' : 'P1',
        quality,
        attackPattern: pattern,
        steps: [
          'Ensure vocabulary review row exists for the student.',
          `Submit quality=${quality} with ${pattern} timing.`,
          'Verify EF, interval, repetitions, nextReviewAt, version, and duplicate side effects.',
        ],
        expectedResult: 'Invalid quality is rejected; valid quality advances exactly once per intentional review.',
        oracle: 'EF cannot corrupt, interval cannot become negative, and concurrent replay cannot count as multiple genuine reviews.',
        automationTarget: 'sm2',
      });
    }
  }

  const websocketTopics = ['/topic/notifications', '/user/queue/notifications', '/topic/leaderboard', '/topic/exams', '/topic/classes'];
  const websocketPatterns = ['anonymous_connect', 'expired_token_connect', 'subscribe_without_auth', 'reconnect_100', 'duplicate_frame', 'out_of_order_frame', 'large_frame', 'slow_consumer', 'stale_event_replay'];
  for (const topic of websocketTopics) {
    for (const pattern of websocketPatterns) {
      focused.push({
        id: scenarioId(index++),
        generatedAt: now,
        module: 'WebSocket',
        method: 'STOMP',
        path: topic,
        role: pattern.includes('anonymous') ? 'anonymous' : 'student_self',
        testType: 'realtime',
        threat: 'websocket_auth_bypass',
        priority: pattern.includes('auth') || pattern.includes('anonymous') ? 'P0' : 'P1',
        attackPattern: pattern,
        steps: [
          'Open SockJS/STOMP connection to /ws.',
          `Apply pattern ${pattern} while subscribing/publishing to ${topic}.`,
          'Validate authorization, duplicate delivery, memory growth, and REST/WebSocket consistency.',
        ],
        expectedResult: 'Only authenticated, authorized subscriptions receive current events once.',
        oracle: 'No anonymous subscription to sensitive topics; no stale replay; no unbounded resource growth.',
        automationTarget: 'websocket',
      });
    }
  }
  return focused;
}

function toCsvRow(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function writeJson(relativePath, value) {
  writeFileSync(join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  writeFileSync(join(root, relativePath), value);
}

function buildPostmanCollection(operations) {
  const sampleOps = operations.slice(0, 120);
  return {
    info: {
      name: 'EngAcademy LMS Enterprise QA Smoke and Security',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      description: 'Generated from the live OpenAPI surface. Use with qa-test-suite/api/postman-environment.json.',
    },
    item: sampleOps.map((op) => ({
      name: `${op.method} ${op.path}`,
      request: {
        method: op.method,
        header: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Authorization', value: 'Bearer {{accessToken}}', disabled: op.path.includes('/auth/login') || op.path.includes('/public') },
        ],
        url: {
          raw: `{{baseUrl}}${op.path.replaceAll('{', ':').replaceAll('}', '')}`,
          host: ['{{baseUrl}}'],
          path: op.path.split('/').filter(Boolean),
        },
        body: ['POST', 'PUT', 'PATCH'].includes(op.method) ? { mode: 'raw', raw: '{}' } : undefined,
      },
      event: [
        {
          listen: 'test',
          script: {
            exec: [
              'pm.test("response is not a 5xx", function () {',
              '  pm.expect(pm.response.code).to.be.below(500);',
              '});',
              'pm.test("no obvious stack trace leaked", function () {',
              '  pm.expect(pm.response.text()).to.not.include("java.lang.");',
              '});',
            ],
          },
        },
      ],
    })),
  };
}

const openapi = await loadOpenApi();
const operations = getOperations(openapi);
let index = 1;
const scenarios = [];
for (const operation of operations) {
  for (const role of roles) {
    for (const profile of payloadProfiles) {
      scenarios.push(buildScenario(operation, role, profile, index++));
    }
  }
}
scenarios.push(...buildFocusedScenarios(index));

writeText('reports/scenario-catalog.jsonl', scenarios.map((scenario) => JSON.stringify(scenario)).join('\n') + '\n');
writeText(
  'reports/scenario-catalog.csv',
  [
    ['id', 'module', 'method', 'path', 'role', 'testType', 'threat', 'priority', 'payloadProfile', 'expectedResult'].map(toCsvRow).join(','),
    ...scenarios.map((s) => [s.id, s.module, s.method, s.path, s.role, s.testType, s.threat, s.priority, s.payloadProfile || s.attackPattern, s.expectedResult].map(toCsvRow).join(',')),
  ].join('\n') + '\n',
);
writeJson('reports/scenario-summary.json', {
  generatedAt: now,
  baseUrl,
  openApiSource: openapi.__fallbackReason ? 'fallback_source_scan' : 'live_openapi',
  openApiFallbackReason: openapi.__fallbackReason || null,
  operationCount: operations.length,
  scenarioCount: scenarios.length,
  countsByModule: countBy(scenarios, 'module'),
  countsByTestType: countBy(scenarios, 'testType'),
  countsByPriority: countBy(scenarios, 'priority'),
});

writeJson('api/postman-collection.json', buildPostmanCollection(operations));
writeJson('api/postman-environment.json', {
  name: 'EngAcademy LMS Local QA',
  values: [
    { key: 'baseUrl', value: baseUrl, enabled: true },
    { key: 'accessToken', value: '', enabled: true },
    { key: 'studentId', value: '4', enabled: true },
    { key: 'classId', value: '1', enabled: true },
    { key: 'examId', value: '', enabled: true },
    { key: 'examResultId', value: '', enabled: true },
  ],
});

writeText('api/newman-run.sh', `#!/usr/bin/env bash
set -euo pipefail
newman run qa-test-suite/api/postman-collection.json \\
  -e qa-test-suite/api/postman-environment.json \\
  --reporters cli,json \\
  --reporter-json-export qa-test-suite/reports/newman-results.json
`);

writeText('performance/k6-load-test.js', `import http from 'k6/http';
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

const baseUrl = __ENV.BASE_URL || '${baseUrl}';

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
`);

writeText('websocket/stomp-stress.mjs', `#!/usr/bin/env node
const baseWs = process.env.WS_URL || 'ws://localhost:8080/ws/websocket';
const connections = Number(process.env.CONNECTIONS || 25);
const topic = process.env.TOPIC || '/topic/notifications';
const sockets = [];

function frame(command, headers = {}, body = '') {
  const lines = [command, ...Object.entries(headers).map(([k, v]) => \`\${k}:\${v}\`), '', body];
  return lines.join('\\n') + '\\0';
}

for (let i = 0; i < connections; i++) {
  const ws = new WebSocket(baseWs);
  sockets.push(ws);
  ws.addEventListener('open', () => {
    ws.send(frame('CONNECT', { 'accept-version': '1.2', host: 'localhost' }));
    ws.send(frame('SUBSCRIBE', { id: \`sub-\${i}\`, destination: topic }));
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
`);

writeText('concurrency/duplicate-submit-race.mjs', `#!/usr/bin/env node
const baseUrl = process.env.BASE_URL || '${baseUrl}';
const token = process.env.STUDENT_TOKEN;
const examResultId = process.env.EXAM_RESULT_ID;
if (!token || !examResultId) {
  console.error('Set STUDENT_TOKEN and EXAM_RESULT_ID before running.');
  process.exit(2);
}
const body = JSON.stringify({ examResultId: Number(examResultId), answers: [] });
const attempts = Number(process.env.ATTEMPTS || 20);
const responses = await Promise.all(Array.from({ length: attempts }, async (_, i) => {
  const startedAt = Date.now();
  const res = await fetch(\`\${baseUrl}/api/v1/exams/0/submit-anticheat\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
    body,
  });
  return { attempt: i + 1, status: res.status, ms: Date.now() - startedAt, text: (await res.text()).slice(0, 300) };
}));
console.log(JSON.stringify({ attempts, successCount: responses.filter((r) => r.status >= 200 && r.status < 300).length, responses }, null, 2));
`);

writeJson('anti-cheat/anti-cheat-attack-matrix.json', scenarios.filter((s) => s.module === 'Anti-Cheat'));
writeJson('sm2/sm2-quality-boundary-matrix.json', scenarios.filter((s) => s.module === 'SRS' && s.path === '/api/v1/srs/review'));

writeText('sql/db-integrity-validation.sql', `-- EngAcademy LMS QA integrity checks. Run read-only against a QA database snapshot.
SELECT exam_id, student_id, COUNT(*) AS submitted_results
FROM EXAM_RESULT
WHERE submitted_at IS NOT NULL
GROUP BY exam_id, student_id
HAVING COUNT(*) > 1;

SELECT exam_result_id, event_type, COUNT(*) AS duplicate_events
FROM ANTI_CHEAT_EVENT
GROUP BY exam_result_id, event_type, event_time
HAVING COUNT(*) > 1;

SELECT user_id, vocabulary_id, COUNT(*) AS review_rows
FROM FLASHCARD_REVIEW
WHERE vocabulary_id IS NOT NULL
GROUP BY user_id, vocabulary_id
HAVING COUNT(*) > 1;

SELECT id, user_id, vocabulary_id, easiness_factor, interval_days, repetitions, next_review_at
FROM FLASHCARD_REVIEW
WHERE easiness_factor < 1.3 OR interval_days < 0 OR repetitions < 0 OR next_review_at IS NULL;

SELECT sc.student_id, sc.class_id, c.school_id AS class_school_id, u.school_id AS student_school_id
FROM STUDENT_CLASS sc
JOIN CLASS c ON c.id = sc.class_id
JOIN USERS u ON u.id = sc.student_id
WHERE u.school_id IS NOT NULL AND c.school_id <> u.school_id;
`);

writeText('regression/ci-regression-template.yml', `name: EngAcademy QA Regression
on:
  workflow_dispatch:
  pull_request:
jobs:
  qa-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - name: Generate scenario catalog
        run: node qa-test-suite/automation/generate-enterprise-scenarios.mjs
      - name: Run live probes against configured environment
        env:
          BASE_URL: \${{ secrets.QA_BASE_URL }}
        run: node qa-test-suite/automation/run-live-probes.mjs
`);

writeText('docs/scenario-generation-methodology.md', `# Scenario Generation Methodology

Generated at: ${now}

This catalog combines the live OpenAPI surface with enterprise QA threat profiles:

- role boundaries: anonymous, admin, school manager, teacher, student self, student peer, tampered JWT
- payload boundaries: malformed JSON, nulls, type confusion, SQLi, XSS, unicode, oversized bodies, pagination abuse
- workflow attacks: replay, duplicate submit, stale state, out-of-order state transitions
- concurrency patterns: 2, 20, and focused high-contention races
- domain modules: exams, anti-cheat, SM-2/SRS, leaderboard, classroom, multi-school isolation, notifications, WebSocket

The generated JSONL file is intended as the canonical machine-readable catalog. CSV is included for review and triage.
`);

writeText('docs/QA_SCOPE.md', `# QA Scope

Target: already-running EngAcademy LMS local stack.

Constraints honored by this suite:

- no service restart
- no dependency installation
- no infrastructure recreation
- no business logic or DB schema edits
- active tests use HTTP/WebSocket/API calls only

Some active probes intentionally create QA exam attempts, anti-cheat events, SRS reviews, and duplicate-submit evidence in the running QA database. Run against production only with a disposable test tenant.
`);

writeText('reports/scenario-index.md', `# EngAcademy LMS Scenario Index

- Generated at: ${now}
- Base URL: ${baseUrl}
- Operations: ${operations.length}
- Scenarios: ${scenarios.length}
- Catalog JSONL: reports/scenario-catalog.jsonl
- Catalog CSV: reports/scenario-catalog.csv
- Postman collection: api/postman-collection.json
- k6 load test: performance/k6-load-test.js
- WebSocket stress script: websocket/stomp-stress.mjs
- SQL integrity checks: sql/db-integrity-validation.sql
`);

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

console.log(JSON.stringify({
  generatedAt: now,
  baseUrl,
  operationCount: operations.length,
  scenarioCount: scenarios.length,
  openApiSource: openapi.__fallbackReason ? 'fallback_source_scan' : 'live_openapi',
}, null, 2));
