# SEC-HIGH-002: OpenAPI And Swagger Are Publicly Accessible

- Bug ID: SEC-HIGH-002
- Severity: High
- Priority: P1
- Module: API Documentation Exposure
- Endpoint: `GET /v3/api-docs`, `GET /swagger-ui/index.html`
- Actor: Anonymous user

## Preconditions

- No authentication header.

## Steps To Reproduce

1. Call `GET /v3/api-docs`.
2. Call `GET /swagger-ui/index.html`.

## Expected Behavior

Production-like runtime hides Swagger/OpenAPI or requires admin/internal access.

## Actual Behavior

Both endpoints returned `200`.

## Root Cause Hypothesis

`SecurityConfig` permits Swagger paths when `application.security.swagger.enabled=true`.

## Security Impact

Attackers can enumerate endpoints, schemas, request bodies, and sensitive workflows.

## Business Impact

Increases exploit speed for IDOR, race, and privilege-escalation issues.

## Logs

```text
openapi_public status=200 ms=381
swagger_ui_public status=200 ms=9
```

## Suggested Fix

Disable Swagger/OpenAPI outside dev, or protect it with admin auth/IP allowlist.
