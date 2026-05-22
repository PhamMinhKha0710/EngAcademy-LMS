# Chiến lược nhánh fix QA (từ `dev`)

Base branch: **`dev`**  
Merge target sau review: **`dev`** → khi hết blocker + retest → `main`

## Quy ước tên nhánh

```text
fix/<mức-độ>-<mã-bug>-<mô-tả-ngắn>
```

| Tiền tố | Ý nghĩa |
|---------|---------|
| `fix/blocker-*` | P0 — chặn release (multi-school, WS leak) |
| `fix/sec-*` | Bảo mật High / Blocker |
| `fix/high-*` | High không chặn GO một mình |
| `fix/perf-*` | Performance |

## Sơ đồ

```text
dev
 ├── fix/blocker-001-cross-school-exam-isolation
 ├── fix/blocker-002-cross-tenant-exam-reads
 ├── fix/sec-blocker-001-ws-notification-leak
 ├── fix/sec-high-001-refresh-token-replay
 ├── fix/sec-high-002-openapi-swagger-gate
 ├── fix/sec-high-003-seed-credentials
 ├── fix/sec-high-004-rate-limit-xff
 ├── fix/high-001-business-errors-4xx
 ├── fix/high-concurrency-duplicate-submit-409
 ├── fix/high-ws-subscribe-authorization
 └── fix/high-anti-cheat-scope-validation
```

## Nhánh ↔ Bug QA

| Nhánh | Bug ID | File báo cáo |
|-------|--------|----------------|
| `fix/blocker-001-cross-school-exam-isolation` | BUG-BLOCKER-001 | `reports/blocker-bugs/BUG-BLOCKER-001-*.md` |
| `fix/blocker-002-cross-tenant-exam-reads` | BUG-BLOCKER-002 | `reports/blocker-bugs/BUG-BLOCKER-002-*.md` |
| `fix/sec-blocker-001-ws-notification-leak` | SEC-BLOCKER-001 | `reports/blocker-bugs/SEC-BLOCKER-001-*.md` |
| `fix/sec-high-001-refresh-token-replay` | SEC-HIGH-001 | `reports/security/SEC-HIGH-001-*.md` |
| `fix/sec-high-002-openapi-swagger-gate` | SEC-HIGH-002 | `reports/security/SEC-HIGH-002-*.md` |
| `fix/sec-high-003-seed-credentials` | SEC-HIGH-003 | `reports/security/SEC-HIGH-003-*.md` |
| `fix/sec-high-004-rate-limit-xff` | SEC-HIGH-004 | `reports/security/SEC-HIGH-004-*.md` |
| `fix/high-001-business-errors-4xx` | BUG-HIGH-001 | `reports/business-logic/BUG-HIGH-001-*.md` |
| `fix/high-concurrency-duplicate-submit-409` | CONC-HIGH-001 | `reports/concurrency/CONC-HIGH-001-*.md` |
| `fix/high-ws-subscribe-authorization` | WS-HIGH-001 | `reports/websocket/WS-HIGH-001-*.md` |
| `fix/high-anti-cheat-scope-validation` | ANTI-CHEAT-HIGH-001 | `reports/anti-cheat/ANTI-CHEAT-HIGH-001-*.md` |

**Không tạo nhánh code** (vận hành / môi trường):

- `PROD-HIGH-001` — chạy FrontEnd/Admin local (`npm run dev`)
- `PERF-MED-001` — tối ưu sau khi P0 xong; có thể nhánh `fix/perf-med-001-questions-latency` khi bắt đầu

## Thứ tự ưu tiên & phụ thuộc

### Wave 1 — Blocker (song song tối đa 3 dev)

1. `fix/blocker-001-*` — enrollment + school boundary trên exam take/start/active  
2. `fix/blocker-002-*` — authorize exam/result/anti-cheat reads theo school/class  
3. `fix/sec-blocker-001-*` — private notification chỉ `/user/queue/...`, bỏ topic theo username  

**Gợi ý merge:** 001 → 002 (cùng `ExamController` / `ExamService`). 003 độc lập, merge bất kỳ lúc nào.

### Wave 2 — High security (song song)

4. `fix/sec-high-001-*`  
5. `fix/sec-high-002-*`  
6. `fix/sec-high-003-*`  
7. `fix/sec-high-004-*`  

### Wave 3 — High hành vi / WS

8. `fix/high-001-*` + `fix/high-concurrency-*` (cùng error mapping — nên một PR hoặc merge 001 trước)  
9. `fix/high-ws-subscribe-*` (sau hoặc cùng SEC-BLOCKER-001)  
10. `fix/high-anti-cheat-*` (sau blocker-001)

## Lệnh làm việc

```bash
# Đồng bộ dev
git checkout dev
git pull origin dev

# Tạo nhánh fix (đã tạo sẵn — hoặc tạo lại)
git checkout -b fix/blocker-001-cross-school-exam-isolation dev

# Làm xong → push & PR vào dev
git push -u origin fix/blocker-001-cross-school-exam-isolation
```

## Retest sau merge vào `dev`

Chạy checklist: `reports/regression/regression-retest-checklist.md`  
Probe: `node qa-enterprise-testing/artifacts/ws-notification-leak-probe.mjs` (và các script trong `artifacts/`)

## Tiêu chí merge vào `main`

- Cả 3 blocker + SEC-BLOCKER retest PASS trên tenant 2 trường mới  
- Regression checklist PASS  
- FE reachable (PROD-HIGH-001) cho smoke UI
