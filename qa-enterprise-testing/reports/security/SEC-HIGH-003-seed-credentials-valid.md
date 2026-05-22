# SEC-HIGH-003: Documented Seed Credentials Are Valid On Running System

- Bug ID: SEC-HIGH-003
- Severity: High
- Priority: P1
- Module: Authentication / Environment Hardening
- Endpoint: `POST /api/v1/auth/login`
- Actor: Anonymous attacker using documented accounts

## Preconditions

- Known seed credentials from `Docs/06-Test-Accounts.md`.

## Steps To Reproduce

1. Login as `admin/Admin@123`.
2. Login as `school1/School@123`.
3. Login as `teacher1/Teacher@123`.
4. Login as `student1/Student@123`.
5. Login as `student2/Student@123`.

## Expected Behavior

Predictable seed accounts are disabled in any production-like QA runtime.

## Actual Behavior

All five seeded role logins returned `200`.

## Root Cause Hypothesis

The running runtime includes dev seed data or predictable bootstrap credentials.

## Security Impact

If deployed similarly, attackers gain valid sessions up to admin.

## Business Impact

Complete tenant and student data compromise in production.

## Logs

```text
admin: status=200
school: status=200
teacher: status=200
student1: status=200
student2: status=200
```

## Suggested Fix

Make seed accounts dev-only, force password rotation, and verify production startup fails without explicit secure admin bootstrap.
