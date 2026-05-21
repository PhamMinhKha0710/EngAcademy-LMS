-- EngAcademy LMS QA integrity checks. Run read-only against a QA database snapshot.
SELECT exam_id, student_id, COUNT(*) AS submitted_results
FROM EXAM_RESULT
WHERE submitted_at IS NOT NULL
GROUP BY exam_id, student_id
HAVING COUNT(*) > 1;

SELECT exam_result_id, event_type, COUNT(*) AS duplicate_events
FROM ANTI_CHEAT_EVENT
GROUP BY exam_result_id, event_type, event_time
HAVING COUNT(*) > 1;

SELECT user_id, vocabulary_id, COUNT(*) AS review_rows
FROM FLASHCARD_REVIEW
WHERE vocabulary_id IS NOT NULL
GROUP BY user_id, vocabulary_id
HAVING COUNT(*) > 1;

SELECT id, user_id, vocabulary_id, easiness_factor, interval_days, repetitions, next_review_at
FROM FLASHCARD_REVIEW
WHERE easiness_factor < 1.3 OR interval_days < 0 OR repetitions < 0 OR next_review_at IS NULL;

SELECT sc.student_id, sc.class_id, c.school_id AS class_school_id, u.school_id AS student_school_id
FROM STUDENT_CLASS sc
JOIN CLASS c ON c.id = sc.class_id
JOIN USERS u ON u.id = sc.student_id
WHERE u.school_id IS NOT NULL AND c.school_id <> u.school_id;
