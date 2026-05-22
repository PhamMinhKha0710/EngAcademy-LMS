# EngAcademy LMS Enterprise QA Final Report

## Recommendation

NO-GO for production.

The current runtime fails core multi-school isolation and private realtime notification guarantees. These are tenant-separation blockers, not cosmetic defects.

## Confirmed Bugs And Risks

| ID | Severity | Module | Status |
|---|---|---|---|
| BUG-BLOCKER-001 | Blocker | Exam / Multi-School | Student from school 1 can view/take/start/submit school 3 exam |
| BUG-BLOCKER-002 | Blocker | Exam Results / Anti-Cheat | Teacher/school cross-tenant result and anti-cheat reads |
| SEC-BLOCKER-001 | Blocker | WebSocket / Notifications | Student can receive another user's notification topic |
| SEC-HIGH-001 | High | Auth | Refresh token replay and refresh after logout |
| SEC-HIGH-002 | High | API Docs | Swagger/OpenAPI publicly reachable |
| SEC-HIGH-003 | High | Auth | Seed credentials valid |
| SEC-HIGH-004 | High | Rate Limit | `X-Forwarded-For` spoof bypass |
| BUG-HIGH-001 | High | Error Handling | Business conflicts return HTTP 500 |
| CONC-HIGH-001 | High | Concurrency | Duplicate submit rejected as 500 |
| WS-HIGH-001 | High | WebSocket | No destination authorization for subscribe |
| PROD-HIGH-001 | High | Frontend | Frontend not reachable on expected ports |
| PERF-MED-001 | Medium | Performance | Questions endpoint p99 over 1s at 50 concurrency |

## Passes Observed

- Invalid JWT rejected with `401`.
- Forged role header did not escalate.
- SQL/XSS login payloads returned `401`, not 500.
- Access token after logout returned `401`.
- SRS quality bounds returned `400`.
- SRS duplicate same-day parallel replay returned `409`.
- Anonymous WebSocket CONNECT rejected.
- Authenticated 100-connection WebSocket storm completed with 0 errors.

## Coverage Limits

- Browser/UI QA could not be completed because frontend was not reachable.
- Full 10k concurrent user test was not executed on this shared running stack to avoid intentional DoS and because `k6` is not installed. Controlled load and WebSocket storm were executed; a dedicated isolated load environment is required before release.

## GO / NO-GO Gate

NO-GO until all blocker files under `reports/blocker-bugs/` are fixed and retested live with a fresh cross-school tenant.
