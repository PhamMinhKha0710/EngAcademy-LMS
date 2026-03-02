# Security – Exam Ownership Validation

## Mô tả vấn đề

Bài thi và kết quả thi (ExamResult) phải được bảo vệ theo ownership:
- Học sinh chỉ submit bài của chính mình.
- Học sinh chỉ xem kết quả của chính mình.
- Giáo viên/Admin có thể xem kết quả của học sinh trong lớp mình.

Nếu không validate: học sinh A có thể gửi request submit thay học sinh B, hoặc xem điểm của B.

## Nguyên nhân

- Controller nhận examResultId từ path/body mà không kiểm tra examResult thuộc principal.
- Service thiếu logic `examResult.getStudent().getId().equals(principalId)`.

## Cách debug

1. Student A đăng nhập, lấy examResultId của Student B (vd: từ DB hoặc API khác).
2. Gọi `POST /exam-submit` với examResultId của B → nếu thành công thì bug.
3. Trace code: ExamService có check ownership không.

## Giải pháp

1. **Controller**: Truyền `principal.getId()` (hoặc userId) xuống service.
2. **Service**: Trước khi xử lý submit/result:
   - Load ExamResult theo id.
   - Kiểm tra `examResult.getStudent().getId().equals(principalUserId)`.
   - Nếu không khớp → throw AccessDeniedException.
3. **Teacher/Admin**: Có thể cần logic khác (xem tất cả result trong class) – tùy nghiệp vụ.

Vị trí: `ExamController.java` (lines ~180, 197), `ExamService.java` (lines ~525, 560).

## Code mẫu (nếu có)

```java
// ExamController
@PostMapping("/submit")
public ResponseEntity<?> submit(@RequestBody ExamSubmitDTO dto, Principal principal) {
    Long userId = getUserId(principal);
    return ResponseEntity.ok(examService.submitExam(dto, userId));
}

// ExamService
public void submitExam(ExamSubmitDTO dto, Long principalUserId) {
    ExamResult result = examResultRepository.findById(dto.getExamResultId()).orElseThrow();
    if (!result.getStudent().getId().equals(principalUserId)) {
        throw new AccessDeniedException("Cannot submit for another student");
    }
    // ... submit logic
}
```

## Bài học rút ra

- Luôn truyền principal/userId từ controller xuống service cho authorization.
- Ownership check ở service layer, không chỉ ở controller.

## Cách phòng tránh sau này

1. Mọi endpoint exam result: kiểm tra ownership.
2. Integration test: student A gọi submit cho B → expect 403.
3. Liên quan: [memory/features/anti-cheat-exam-security.md](../features/anti-cheat-exam-security.md)
