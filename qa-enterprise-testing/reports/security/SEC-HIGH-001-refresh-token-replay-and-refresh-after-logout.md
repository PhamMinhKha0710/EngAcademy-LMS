# SEC-HIGH-001: Refresh Token Replay And Refresh After Logout

- Bug ID: SEC-HIGH-001
- Severity: High
- Priority: P1
- Module: Authentication
- Endpoint: `POST /api/v1/auth/refresh-token`, `POST /api/v1/auth/logout`
- Actor: Authenticated student

## Preconditions

- User has a valid access token and refresh token.

## Steps To Reproduce

1. Login as `student1`.
2. Reuse the same refresh token twice.
3. Login as `student2`.
4. Logout using the access token.
5. Reuse the old refresh token after logout.

## Expected Behavior

Refresh tokens are rotated and one-time use, or at least revoked on logout.

## Actual Behavior

- First refresh replay returned `200`.
- Second refresh replay returned `200`.
- Refresh after logout returned `200`.
- Access token after logout correctly returned `401`.

## Root Cause Hypothesis

`AuthService.refreshToken` validates a stateless JWT refresh token and issues new tokens without persistence, rotation state, or blacklist/reuse detection. `logout` blacklists only the access token from the `Authorization` header.

## Security Impact

Stolen refresh tokens remain usable after logout and can be replayed until expiry.

## Business Impact

Account sessions cannot be reliably terminated after device loss or compromise.

## Logs

```text
refresh_replay_first status=200
refresh_replay_second status=200
logout status=200
refresh_after_logout status=200
access_after_logout status=401
```

## Suggested Fix

Persist refresh token family IDs, rotate on every refresh, detect reuse, revoke token families on logout/password change, and include `jti` in both access and refresh tokens.
