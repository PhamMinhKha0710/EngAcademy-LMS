# [Test] TestDataFactory thiếu method cho ExamAntiCheat và MistakeNotebook

## Mô tả vấn đề

Sau khi merge branch `feat/full/speech-realtime` vào `dev`, các test `ExamAntiCheatControllerTest` và `MistakeNotebookControllerTest` bị fail do `TestDataFactory` thiếu các method cần thiết cho ExamAntiCheat và MistakeNotebook. Cụ thể:
- Thiếu `antiCheatEventDTO(...)`, `examSubmitDTO(...)`, `examSubmitAnswerDTO(...)` hoặc tương tự cho ExamAntiCheat.
- Thiếu `mistakeNotebookRequest(...)` hoặc method tạo MistakeNotebook cho MistakeNotebook test.

## Nguyên nhân

- Feature branch thêm entity/DTO mới (AntiCheatEvent, MistakeNotebook) và test mới.
- `TestDataFactory` trong branch đó hoặc trong dev chưa có method tương ứng.
- Merge conflict hoặc merge không đầy đủ → TestDataFactory thiếu method mà test đang gọi.

## Cách debug

1. Chạy `mvn test` → xem stack trace: `NoSuchMethodError` hoặc `method X not found`.
2. Mở `ExamAntiCheatControllerTest`, `MistakeNotebookControllerTest` → liệt kê các `TestDataFactory.xxx()` được gọi.
3. Mở `TestDataFactory.java` → kiểm tra từng method có tồn tại không.
4. So sánh với branch gốc (feat/full/speech-realtime) nếu cần.

## Giải pháp

Thêm các method thiếu vào `TestDataFactory`:

- `antiCheatEventDTO(Long examResultId, String eventType)` → trả `AntiCheatEventDTO` hoặc request tương ứng.
- `examSubmitDTO(Long examResultId, List<ExamSubmitAnswerDTO> answers)`.
- `examSubmitAnswerDTO(Long questionId, Long optionId)`.
- `mistakeNotebookRequest(Long userId, Long vocabularyId)`.

Vị trí: `BackEnd/src/test/java/com/englishlearn/fixtures/TestDataFactory.java`.

Commit tham khảo: cf2288e, 452c2c0.

## Code mẫu (nếu có)

```java
// TestDataFactory
public static AntiCheatEventDTO antiCheatEventDTO(Long examResultId, String eventType) {
    return AntiCheatEventDTO.builder()
        .examResultId(examResultId)
        .eventType(eventType)
        .build();
}

public static MistakeNotebookRequest mistakeNotebookRequest(Long userId, Long vocabularyId) {
    return MistakeNotebookRequest.builder()
        .userId(userId)
        .vocabularyId(vocabularyId)
        .build();
}
```

## Bài học rút ra

- Khi merge feature branch có test mới: đảm bảo TestDataFactory (hoặc fixture tương tự) có đủ method.
- TestDataFactory là single source of truth cho test data; mọi entity/DTO mới cần thêm factory method.

## Cách phòng tránh sau này

1. Trước merge: chạy full test suite, fix ngay nếu fail.
2. Checklist merge: "TestDataFactory đã có method cho entity/DTO mới chưa?"
3. Document trong TestDataFactory: list các entity/DTO được hỗ trợ và method tương ứng.
4. CI: chạy test trước khi merge, block nếu test fail.
