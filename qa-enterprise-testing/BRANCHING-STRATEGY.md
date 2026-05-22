# Chiến lược nhánh fix QA — Wave 4 (live retest 2026-05-22)

Base branch: **`dev`** (`b1b7f82` trở lên)  
Merge target: **`dev`** → sau retest → `main`

Báo cáo: `reports/enterprise-qa-final-report.md`  
Checklist: `reports/regression/regression-retest-checklist.md`

## Wave 1–3 (đã merge `dev`)

Các nhánh cũ (`fix/blocker-001-cross-school-exam-isolation`, `fix/sec-high-001-refresh-token-replay`, …) xử lý exam isolation, WS topic leak, refresh rotation. **Đã pass** trong live log wave 4 (exam/class read 403).

## Wave 4 — NO-GO hiện tại

### Blocker (P0)

| Nhánh | Bug ID | Báo cáo |
|-------|--------|---------|
| `fix/blocker-001-cross-school-notification-write` | BUG-BLOCKER-001 | `reports/blocker-bugs/BUG-BLOCKER-001-cross-school-notification-write-broadcast.md` |
| `fix/blocker-002-cross-school-leaderboard-leak` | BUG-BLOCKER-002 | `reports/blocker-bugs/BUG-BLOCKER-002-cross-school-leaderboard-leak.md` |

### Critical (P0)

| Nhánh | Bug ID | Báo cáo |
|-------|--------|---------|
| `fix/critical-001-exam-utc-timezone` | BUG-CRITICAL-001 | `reports/critical-bugs/BUG-CRITICAL-001-exam-utc-timezone-breaks-availability.md` |
| `fix/critical-002-anticheat-server-timestamp` | AC-CRITICAL-001 | `reports/anti-cheat/AC-CRITICAL-001-client-timestamp-accepted.md` |

### High (P1)

| Nhánh | Bug ID | Báo cáo |
|-------|--------|---------|
| `fix/high-conc-001-submit-idempotent-409` | CONC-HIGH-001 | `reports/concurrency/CONC-HIGH-001-duplicate-concurrent-submit-returns-success.md` |
| `fix/high-ac-002-post-submit-anticheat-reject` | AC-HIGH-002 | `reports/anti-cheat/AC-HIGH-002-post-submit-events-return-200-without-persisting.md` |
| `fix/high-sm2-001-quality-required` | SM2-HIGH-001 | `reports/sm2/SM2-HIGH-001-missing-quality-defaults-to-zero.md` |
| `fix/high-ws-001-user-queue-delivery` | WS-HIGH-001 | `reports/websocket/WS-HIGH-001-user-queue-notification-not-delivered.md` |
| `fix/high-api-001-malformed-json-400` | API-HIGH-001 | `reports/business-logic/API-HIGH-001-malformed-json-returns-500.md` |

### Security / runtime (P1 — chủ yếu profile & deploy)

| Nhánh | Bug ID | Báo cáo | Ghi chú |
|-------|--------|---------|---------|
| `fix/sec-high-001-prod-runtime-profile` | SEC-HIGH-001 | `reports/security/SEC-HIGH-001-swagger-openapi-public-dev-profile-seed-login.md` | Xác nhận prod profile + Redis; không chạy QA trên `dev` profile |

### Không tạo nhánh code (vận hành)

- `PERF-MED-001` — tối ưu sau P0
- `PROD-HIGH-001` — FE reachability / deploy

## Thứ tự merge đề xuất

```text
Wave 4a (blocker, song song):
  fix/blocker-001-cross-school-notification-write
  fix/blocker-002-cross-school-leaderboard-leak

Wave 4b (critical, có thể song song):
  fix/critical-001-exam-utc-timezone
  fix/critical-002-anticheat-server-timestamp

Wave 4c (high):
  fix/high-conc-001-submit-idempotent-409
  fix/high-ac-002-post-submit-anticheat-reject
  fix/high-sm2-001-quality-required
  fix/high-ws-001-user-queue-delivery
  fix/high-api-001-malformed-json-400
```

**Phụ thuộc:** `high-ac-002` sau `critical-002` (cùng `ExamService.logAntiCheatEvent`).  
`high-ws-001` độc lập (cùng module notification với blocker-001 nhưng khác layer).

## Lệnh làm việc

```bash
git checkout dev
git pull origin dev

# Tạo nhánh (đã chạy script / tạo sẵn — xem bên dưới)
git checkout -b fix/blocker-001-cross-school-notification-write

# Sau khi fix + test
git push -u origin fix/blocker-001-cross-school-notification-write
# PR → dev, review, merge

# Retest
node qa-enterprise-testing/artifacts/qa-retest-after-fix.mjs   # nếu có
# + checklist: reports/regression/regression-retest-checklist.md
```

## Phân biệt ID bug cũ vs mới

| ID | Wave 1–3 (resolved) | Wave 4 (open) |
|----|---------------------|---------------|
| BUG-BLOCKER-001 | Exam cross-school take/start | **Notification write/broadcast** |
| BUG-BLOCKER-002 | Teacher exam/results read | **Leaderboard around-user leak** |

File báo cáo cũ (exam) đã xóa khỏi tree; chỉ dùng file tên mới trong `reports/blocker-bugs/`.

## Wave 5 — merged `dev` (2026-05-22)

Base: `734e8f7` (wave 4) → merge target `dev`

### Blocker / Critical

| Nhánh | Bug ID | Báo cáo |
|-------|--------|---------|
| `fix/blocker-003-gamification-tenant-isolation` | BUG-BLOCKER-003, CONC-CRITICAL-002 | `reports/blocker-bugs/BUG-BLOCKER-003-...md`, `reports/concurrency/CONC-CRITICAL-002-...md` |
| `fix/blocker-004-classroom-teacher-school-validation` | BUG-BLOCKER-004 | `reports/blocker-bugs/BUG-BLOCKER-004-...md` |
| `fix/critical-002-exam-schedule-zone` | BUG-CRITICAL-002 | `reports/critical-bugs/BUG-CRITICAL-002-...md` |

### Medium (WebSocket)

| Nhánh | Bug ID | Báo cáo |
|-------|--------|---------|
| `fix/ws-med-002-leaderboard-topic-subscribe` | WS-MED-002 | `reports/websocket/WS-MED-002-...md` |

### Thứ tự merge

```text
fix/blocker-003-gamification-tenant-isolation   # SchoolTenantGuard + coins/badges/progress
  → fix/blocker-004-classroom-teacher-school-validation  # phụ thuộc guard
  → fix/critical-002-exam-schedule-zone
  → fix/ws-med-002-leaderboard-topic-subscribe
```

**Cấu hình:** `application.exam.schedule-zone=Asia/Ho_Chi_Minh` (mặc định trong `ExamScheduleProperties`).
