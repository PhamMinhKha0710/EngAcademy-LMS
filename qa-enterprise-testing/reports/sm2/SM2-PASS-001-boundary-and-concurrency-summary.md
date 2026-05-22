# SM2-PASS-001: SM-2 Boundary And Concurrency Summary

- Bug ID: SM2-PASS-001
- Severity: Pass
- Priority: P3
- Module: SRS / SM-2
- Endpoint: `POST /api/v1/srs/review`
- Actor: Student

## Preconditions

- Student token available.

## Steps To Reproduce

1. Submit `quality=-1`.
2. Submit `quality=6`.
3. Submit valid `quality=5`.
4. Replay 20 concurrent reviews for the same vocabulary.

## Expected Behavior

Invalid quality returns `400`; duplicate same-day/concurrent review returns conflict and does not advance multiple times.

## Actual Behavior

- `quality=-1` returned `400`.
- `quality=6` returned `400`.
- Valid once returned `200`.
- Parallel replays returned `409` with "already reviewed today".

## Root Cause Hypothesis

Current hardening includes validation and same-day idempotency checks.

## Security Impact

No active SM-2 corruption found in this run.

## Business Impact

SRS appeared stable for the tested boundary/replay cases.

## Logs

```text
srs_invalid_quality_low status=400
srs_invalid_quality_high status=400
srs_valid_review_once status=200
srs_parallel_review_* status=409
```

## Suggested Fix

Keep regression tests for quality range, same-day duplicate, stale version, timezone boundary, and concurrent replay.
