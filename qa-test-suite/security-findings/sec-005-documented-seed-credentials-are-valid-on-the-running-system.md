# SEC-005: Documented seed credentials are valid on the running system

- Issue ID: SEC-005
- Severity: High
- Risk Level: Critical in production
- Module: Authentication
- Tested At: 2026-05-21T09:06:17.860Z

## Steps to Reproduce
1. Use the dev seed accounts from DevDataSeeder.
2. POST /api/v1/auth/login for admin, school, teacher, and student roles.

## Expected Result
Seed/demo credentials are disabled outside disposable dev databases.

## Actual Result
5 seeded role logins succeeded.

## Evidence
admin: status=200
school: status=200
teacher: status=200
student1: status=200
student2: status=200

## Root Cause Hypothesis
DevDataSeeder creates predictable accounts and the running database contains them.

## Security Impact
If deployed with the same seed data, attackers gain valid admin/school/teacher/student sessions.

## Production Impact
Full administrative takeover if admin seed remains valid.

## DB Impact
All tenant and student data can be modified by seed admin credentials.

## Concurrency Impact
Valid credentials allow high-volume authenticated abuse.

## Logs
```text
{
  "admin": {
    "status": 200,
    "ok": true,
    "identity": {
      "id": 1,
      "username": "admin",
      "email": "admin@[JWT_REDACTED]",
      "roles": [
        "ROLE_ADMIN"
      ]
    }
  },
  "school": {
    "status": 200,
    "ok": true,
    "identity": {
      "id": 2,
      "username": "school1",
      "email": "school@[JWT_REDACTED]",
      "roles": [
        "ROLE_SCHOOL"
      ]
    }
  },
  "teacher": {
    "status": 200,
    "ok": true,
    "identity": {
      "id": 3,
      "username": "teacher1",
      "email": "teacher@[JWT_REDACTED]",
      "roles": [
        "ROLE_TEACHER"
      ]
    }
  },
  "student1": {
    "status": 200,
    "ok": true,
    "identity": {
      "id": 4,
      "username": "student1",
      "email": "student1@[JWT_REDACTED]",
      "roles": [
        "ROLE_STUDENT"
      ]
    }
  },
  "student2": {
    "status": 200,
    "ok": true,
    "identity": {
      "id": 5,
      "username": "student2",
      "email": "student2@[JWT_REDACTED]",
      "roles": [
        "ROLE_STUDENT"
      ]
    }
  }
}
```

## Screenshots
Placeholder: add browser/API screenshots when reproducing manually.

## Recommended Fix
Never seed predictable users in production; force randomized secrets or one-time bootstrap admin rotation.

## Regression Risk
Medium; dev/test scripts should read credentials from explicit QA env vars.
