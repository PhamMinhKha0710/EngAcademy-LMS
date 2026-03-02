# Exam – Shuffle câu hỏi/đáp án và multi-type grading

## Mô tả vấn đề

Bài thi cần:
- **Shuffle**: Xáo trộn thứ tự câu hỏi và đáp án để mỗi lần làm bài khác nhau, giảm gian lận.
- **Multi-type grading**: Hỗ trợ nhiều loại câu hỏi (multiple choice, true/false, v.v.) và chấm điểm tương ứng.

## Nguyên nhân

- Anti-cheat: shuffle giảm khả năng nhìn bài nhau.
- Nghiệp vụ: nhiều dạng câu hỏi cần logic chấm khác nhau.

## Cách debug

1. Làm bài 2 lần: thứ tự câu/đáp án có khác nhau không.
2. Kiểm tra service: có gọi `Collections.shuffle(questions)` trước khi trả về không.
3. Multi-type: mỗi question type có logic grading riêng (vd: multiple choice so sánh optionId, true/false so sánh boolean).

## Giải pháp

1. **Shuffle questions**: Khi tạo đề cho học sinh, shuffle list questions. Lưu thứ tự đã shuffle (nếu cần) hoặc shuffle mỗi lần trả về.
2. **Shuffle options**: Mỗi câu shuffle các đáp án. Lưu mapping optionId đúng để chấm.
3. **Grading**: Theo question type:
   - Multiple choice: so sánh selectedOptionId vs correctOptionId.
   - True/False: so sánh answer boolean.
   - (Mở rộng) Fill-in, matching: logic tương ứng.

Commits: b058685, 8c8b059, 58cd559, 109cf28. Vị trí: `ExamService`, question/answer logic.

## Code mẫu (nếu có)

```java
// Shuffle
Collections.shuffle(questions);
questions.forEach(q -> Collections.shuffle(q.getOptions()));

// Grading - multiple choice
boolean correct = answer.getSelectedOptionId().equals(question.getCorrectOption().getId());
```

## Bài học rút ra

- Shuffle phải reproduce được khi chấm: lưu thứ tự đã shuffle hoặc chỉ dùng ID để chấm.
- CorrectOption phải không bị lộ sang client; client chỉ nhận optionId, không biết đâu đúng.

## Cách phòng tránh sau này

1. Khi thêm question type mới: thêm case trong grading logic.
2. Unit test: shuffle có thực sự thay đổi thứ tự; grading đúng cho từng type.
