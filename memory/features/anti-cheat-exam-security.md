# Exam – Anti-cheat và security constraints

## Mô tả vấn đề

Bài thi cần chống gian lận (anti-cheat) và đảm bảo security:
- Ghi nhận sự kiện gian lận (đổi tab, copy, v.v.) qua AntiCheatEvent.
- Validate ownership: học sinh chỉ submit/ xem kết quả bài thi của chính mình.
- Security constraints: exam chỉ cho class được chỉ định, v.v.

## Nguyên nhân

- Yêu cầu nghiệp vụ: chống gian lận trong thi online.
- Security: tránh học sinh A submit thay học sinh B, xem kết quả người khác.

## Cách debug

1. Test: Student A gọi submit cho examResult của Student B → expect 403.
2. Kiểm tra ExamService: có validate `examResult.getStudentId().equals(principalId)` không.
3. AntiCheatEvent: xem có lưu event (TAB_SWITCH, etc.) khi frontend gửi không.

## Giải pháp

1. **AntiCheatEvent entity**: Lưu examResultId, eventType, timestamp.
2. **Ownership validation** trong ExamService:
   - Submit: `examResult.studentId == principalId`
   - Get result: tương tự
3. **ExamController**: Truyền `principal.getId()` xuống service để validate.
4. **Exam security constraints**: Exam chỉ assign cho class, student chỉ làm được nếu thuộc class đó.

Commits: 3269193 (AntiCheatEvent), 94e18ac (security constraints), 14bbcce (PR merge). Vị trí: `ExamController.java`, `ExamService.java` (lines 525, 560).

## Code mẫu (nếu có)

```java
// ExamService - ownership validation
if (!examResult.getStudent().getId().equals(principalUserId)) {
    throw new AccessDeniedException("Cannot submit for another student");
}
```

## Bài học rút ra

- Luôn truyền principal/userId từ controller xuống service khi cần authorization.
- Anti-cheat: backend ghi nhận event, frontend gửi khi phát hiện (visibility change, etc.).

## Cách phòng tránh sau này

1. Mọi endpoint liên quan exam result: kiểm tra ownership.
2. Xem: [memory/security/exam-ownership-validation.md](../security/exam-ownership-validation.md)
