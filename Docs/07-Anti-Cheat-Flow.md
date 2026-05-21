# 🛡️ EngAcademy LMS — Anti-Cheat Flow

> **Version:** 1.0  
> **Last Updated:** 2026-05-21

---

## 1. Tổng Quan Cơ Chế Anti-Cheat

Hệ thống Anti-Cheat giám sát hành vi học sinh trong suốt quá trình làm bài thi trực tuyến. Mọi hành vi vi phạm đều được **ghi nhận real-time** và lưu vào database để giáo viên/admin xem lại.

### Các loại sự kiện vi phạm:

| Mã Sự Kiện | Mô Tả | Mức Độ |
|:---|:---|:---|
| `TAB_SWITCH` | Chuyển sang tab/cửa sổ khác | ⚠️ Cao |
| `COPY` | Copy nội dung đề thi | ⚠️ Cao |
| `PASTE` | Paste nội dung vào bài thi | ⚠️ Cao |
| `BLUR` | Mất focus khỏi trang thi | 🔶 Trung bình |
| `RIGHT_CLICK` | Click chuột phải trên trang thi | 🔷 Thấp |
| `DEV_TOOLS` | Mở Developer Tools (F12) | ⚠️ Cao |

---

## 2. Kiến Trúc Anti-Cheat

```mermaid
graph TB
    subgraph "Client Side (Browser)"
        A[📝 Trang Làm Bài Thi]
        B[🔍 Anti-Cheat Monitor JS]
        B --> B1[Tab Visibility API]
        B --> B2[Copy/Paste Event Listener]
        B --> B3[Right Click Listener]
        B --> B4[DevTools Detection]
        B --> B5[Window Blur/Focus]
    end
    
    subgraph "Server Side (Spring Boot)"
        C[ExamController]
        D[ExamService]
        E[AntiCheatEvent Entity]
        F[ExamResult Entity]
    end
    
    subgraph "Database"
        G[(ANTI_CHEAT_EVENT)]
        H[(EXAM_RESULT)]
    end
    
    B1 -->|POST /anti-cheat-event| C
    B2 -->|POST /anti-cheat-event| C
    B3 -->|POST /anti-cheat-event| C
    B4 -->|POST /anti-cheat-event| C
    B5 -->|POST /anti-cheat-event| C
    
    C --> D
    D --> E --> G
    D --> F --> H
```

---

## 3. Luồng Chi Tiết (Sequence Diagram)

```mermaid
sequenceDiagram
    participant S as Student (Browser)
    participant FE as Frontend
    participant BE as Backend API
    participant DB as Database

    Note over S,DB: === PHASE 1: BẮT ĐẦU BÀI THI ===
    
    S->>FE: Click "Bắt đầu bài thi"
    FE->>BE: POST /api/v1/exams/{examId}/start?studentId={id}
    
    Note over BE: Validate: studentId == authenticatedUserId
    Note over BE: Kiểm tra Exam status == PUBLISHED
    Note over BE: Kiểm tra đã có ExamResult chưa (unique constraint)
    
    BE->>DB: Tạo ExamResult (status=IN_PROGRESS)
    BE->>BE: Shuffle câu hỏi (nếu shuffleQuestions=true)
    BE->>BE: Shuffle đáp án (nếu shuffleAnswers=true)
    BE-->>FE: ExamTakeDTO {examResultId, questions (shuffled), antiCheatEnabled}
    
    FE->>FE: Khởi tạo Anti-Cheat Monitor
    FE->>FE: Đăng ký Event Listeners (copy, paste, blur, visibilitychange)
    FE->>FE: Bắt đầu đếm thời gian
    
    Note over S,DB: === PHASE 2: GIÁM SÁT TRONG KHI THI ===
    
    S->>S: Chuyển sang tab khác (Alt+Tab)
    FE->>FE: visibilitychange event triggered → type = TAB_SWITCH
    FE->>BE: POST /api/v1/exams/{examId}/anti-cheat-event
    Note right of FE: Body: {eventType: "TAB_SWITCH", examResultId: X, details: "..."}
    
    Note over BE: Validate: userId == authenticated user
    BE->>DB: INSERT INTO ANTI_CHEAT_EVENT
    BE->>DB: UPDATE EXAM_RESULT SET violation_count = violation_count + 1
    BE-->>FE: 200 OK "Đã ghi nhận sự kiện"
    
    FE->>FE: Hiển thị cảnh báo: "Hành vi gian lận đã được ghi nhận!"
    
    S->>S: Cố gắng Copy nội dung (Ctrl+C)
    FE->>FE: copy event blocked + logged → type = COPY
    FE->>BE: POST /api/v1/exams/{examId}/anti-cheat-event
    BE->>DB: INSERT INTO ANTI_CHEAT_EVENT
    
    Note over S,DB: === PHASE 3: NỘP BÀI ===
    
    S->>FE: Click "Nộp bài"
    FE->>BE: POST /api/v1/exams/{examId}/submit-anticheat
    Note right of FE: Body: ExamSubmitDTO {examResultId, answers[], ...}
    
    Note over BE: Validate ownership (userId == authenticated)
    Note over BE: Validate thời gian (chưa quá deadline)
    BE->>BE: Chấm điểm tự động (so sánh selectedOption.isCorrect)
    BE->>DB: UPDATE EXAM_RESULT (score, correctCount, submittedAt, status=COMPLETED)
    BE-->>FE: ExamResultDTO {score, correctCount, violationCount}
    
    Note over S,DB: === PHASE 4: XEM LẠI VI PHẠM (TEACHER/ADMIN) ===
    
    Note over BE: Teacher xem lại
    BE->>DB: SELECT * FROM ANTI_CHEAT_EVENT WHERE exam_result_id = X
    BE-->>FE: List<AntiCheatEvent> {eventType, eventTime, details}
```

---

## 4. Entity Model

### 4.1. AntiCheatEvent Entity

```java
@Entity
@Table(name = "ANTI_CHEAT_EVENT")
public class AntiCheatEvent {
    @Id @GeneratedValue
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_result_id", nullable = false)
    private ExamResult examResult;
    
    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;  // TAB_SWITCH, COPY, PASTE, BLUR, RIGHT_CLICK, DEV_TOOLS
    
    @Column(name = "event_time", nullable = false)
    private LocalDateTime eventTime;
    
    @Column(columnDefinition = "TEXT")
    private String details;
}
```

### 4.2. Exam Entity (Anti-Cheat Fields)

```java
@Entity
public class Exam {
    // ... other fields
    
    @Column(name = "shuffle_questions", columnDefinition = "boolean default true")
    private Boolean shuffleQuestions = true;
    
    @Column(name = "shuffle_answers", columnDefinition = "boolean default true")
    private Boolean shuffleAnswers = true;
    
    @Column(name = "anti_cheat_enabled", columnDefinition = "boolean default true")
    private Boolean antiCheatEnabled = true;
}
```

### 4.3. ExamResult Entity (Violation Count)

```java
@Entity
public class ExamResult {
    // ... other fields
    
    @Column(name = "violation_count", columnDefinition = "int default 0")
    private Integer violationCount = 0;
}
```

---

## 5. API Endpoints

| # | Method | Endpoint | Role | Mô Tả |
|:---|:---|:---|:---|:---|
| 1 | `POST` | `/exams/{examId}/start?studentId=` | STUDENT | Bắt đầu phiên thi, tạo ExamResult, shuffle |
| 2 | `POST` | `/exams/{examId}/anti-cheat-event` | STUDENT | Ghi nhận sự kiện vi phạm |
| 3 | `POST` | `/exams/{examId}/submit-anticheat` | STUDENT | Nộp bài thi (có anti-cheat validation) |
| 4 | `GET` | `/exams/results/{resultId}/anti-cheat-events` | TEACHER, ADMIN, SCHOOL | Xem lịch sử vi phạm |

### Request Body cho Anti-Cheat Event:

```json
{
  "eventType": "TAB_SWITCH",
  "examResultId": 42,
  "details": "Chuyển tab tại câu hỏi #3"
}
```

---

## 6. Security Considerations

### 6.1. Ownership Validation
```
- startExam: studentId PHẢI == authenticatedUserId
  → Ngăn chặn student A bắt đầu thi cho student B
  
- logAntiCheatEvent: userId tự động lấy từ JWT token
  → Ngăn chặn giả mạo sự kiện anti-cheat

- submitExamWithAntiCheat: userId tự động lấy từ JWT token  
  → Ngăn chặn nộp bài thay người khác
```

### 6.2. Anti-Spoofing
```
- Sự kiện anti-cheat CHỨA timestamp server-side (LocalDateTime.now())
- Client không thể giả mạo thời gian sự kiện
- violationCount được cộng dồn trên server, không nhận từ client
```

### 6.3. Shuffle Protection
```
- Câu hỏi và đáp án được shuffle trên server
- Mỗi student nhận thứ tự khác nhau
- Ngăn chặn chia sẻ đáp án theo vị trí
```

---

## 7. Sơ Đồ Trạng Thái Đề Thi

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Giáo viên tạo đề
    DRAFT --> PUBLISHED: POST /publish
    PUBLISHED --> CLOSED: POST /close hoặc hết thời gian
    CLOSED --> SCORE_PUBLISHED: POST /publish-scores
    
    note right of PUBLISHED
        Học sinh có thể:
        - Bắt đầu làm bài (POST /start)
        - Nộp bài (POST /submit-anticheat)
    end note
    
    note right of CLOSED
        Giáo viên có thể:
        - Xem kết quả
        - Xem anti-cheat events
        - Công bố điểm
    end note
```
