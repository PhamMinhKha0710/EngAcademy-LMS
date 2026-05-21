# Live Probe Summary

- Tested at: 2026-05-21T09:06:17.860Z
- Base URL: http://localhost:8080
- Probe results: 154
- Findings: 3

## Findings
- SEC-001 [High] API Documentation Exposure: OpenAPI and Swagger are publicly accessible (security-findings/sec-001-openapi-and-swagger-are-publicly-accessible.md)
- SEC-005 [High] Authentication: Documented seed credentials are valid on the running system (security-findings/sec-005-documented-seed-credentials-are-valid-on-the-running-system.md)
- RISK-002 [High] Rate Limiting: Login rate limit can be bypassed by spoofing X-Forwarded-For (production-risks/risk-002-login-rate-limit-can-be-bypassed-by-spoofing-x-forwarded-for.md)

## Notes

- Tokens and passwords are redacted from probe logs.
- Tests did not restart services, reinstall dependencies, or alter DB schema.
- Active workflow probes may have inserted QA exam attempts, SRS reviews, and anti-cheat events.
