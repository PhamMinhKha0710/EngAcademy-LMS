# BUG-HIGH-001: Expected Business Errors Return HTTP 500

- Bug ID: BUG-HIGH-001
- Severity: High
- Priority: P1
- Module: Exam / Error Handling
- Endpoint: `POST /api/v1/exams/{id}/start`, `POST /api/v1/exams/{id}/submit-anticheat`, `GET /api/v1/exams/{id}/my-result`
- Actor: Student

## Preconditions

- Exam has already been completed or score is not published.

## Steps To Reproduce

1. Start an already completed exam.
2. Submit the same `examResultId` concurrently.
3. Request `my-result` before scores are published.

## Expected Behavior

Return client/business status codes such as `400`, `403`, or `409`, not server error.

## Actual Behavior

- Already completed exam start returned `500`.
- Duplicate concurrent submits returned `500` for 11/12 rejected requests.
- `my-result` before published score returned `500`.

## Root Cause Hypothesis

`IllegalStateException` and similar domain exceptions are not mapped to business HTTP statuses.

## Security Impact

Attackers can create noisy 500-rate alarms and hide real failures.

## Business Impact

Clients and retry layers may retry deterministic business failures, causing retry storms and poor UX.

## Logs

```text
qa_start_exam_student1 status=500 message="Bạn đã hoàn thành bài thi này"
parallel submit: 1x200, 11x500 message="Bài thi đã được nộp trước đó"
student1_my_result_cross_school status=500 message="Giáo viên chưa công bố kết quả bài thi"
```

## Suggested Fix

Introduce typed domain exceptions and a global exception handler mapping duplicate/already-submitted to `409`, forbidden state to `403`, validation to `400`.
