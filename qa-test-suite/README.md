# EngAcademy LMS Enterprise QA Suite

Generated for the already-running local EngAcademy LMS stack.

## What Was Produced

- `reports/scenario-catalog.jsonl`: 34,853 concrete scenarios generated from 165 live OpenAPI operations.
- `reports/live-probe-results.json`: raw active probe evidence with tokens/passwords redacted.
- `reports/live-probe-summary.md`: concise list of active findings.
- `reports/enterprise-qa-report.md`: executive QA/security/performance report.
- `api/postman-collection.json`: Postman/Newman-ready API suite.
- `performance/k6-load-test.js`: k6 performance and burst-load template.
- `websocket/stomp-stress.mjs`: anonymous/authenticated STOMP stress harness.
- `concurrency/duplicate-submit-race.mjs`: replay race harness for exam submit.
- `sql/db-integrity-validation.sql`: read-only DB consistency checks for duplicate results, SRS corruption, and cross-school enrollment.

## Commands

```bash
node qa-test-suite/automation/generate-enterprise-scenarios.mjs
node qa-test-suite/automation/run-live-probes.mjs
```

Optional:

```bash
newman run qa-test-suite/api/postman-collection.json -e qa-test-suite/api/postman-environment.json
k6 run qa-test-suite/performance/k6-load-test.js
node qa-test-suite/websocket/stomp-stress.mjs
```

## Safety Notes

The active probes do not restart services, install dependencies, recreate infrastructure, modify business logic, or change DB schema. They do create QA-visible runtime data such as exam results, anti-cheat events, and SRS review updates.
