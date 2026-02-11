package com.englishlearn.infrastructure.config;

import com.englishlearn.domain.entity.*;
import com.englishlearn.infrastructure.persistence.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Seeds realistic dev data when running with profile "dev".
 * Use only for local/Swagger testing. Idempotent: skips if seed data already present.
 */
@Slf4j
@Configuration
@Profile("dev")
@RequiredArgsConstructor
public class DevDataSeeder {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final ClassRoomRepository classRoomRepository;
    private final StudentClassRepository studentClassRepository;
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;
    private final VocabularyRepository vocabularyRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final ExamRepository examRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String SEED_ADMIN_USERNAME = "admin";
    private static final String SEED_ADMIN_PASSWORD = "Admin@123";
    private static final String SEED_SCHOOL_PASSWORD = "School@123";
    private static final String SEED_TEACHER_PASSWORD = "Teacher@123";
    private static final String SEED_STUDENT_PASSWORD = "Student@123";

    @Bean
    public CommandLineRunner devSeedData() {
        return args -> {
            if (userRepository.findByUsername(SEED_ADMIN_USERNAME).isPresent()) {
                log.info("Dev data already present (user '{}' exists). Skipping seed.", SEED_ADMIN_USERNAME);
                return;
            }

            log.info("Seeding dev data for Swagger testing...");

            // 1. Roles are already created by DataInitializer
            Role roleAdmin = roleRepository.findByName(Role.ADMIN).orElseThrow();
            Role roleSchool = roleRepository.findByName(Role.SCHOOL).orElseThrow();
            Role roleTeacher = roleRepository.findByName(Role.TEACHER).orElseThrow();
            Role roleStudent = roleRepository.findByName(Role.STUDENT).orElseThrow();

            // 2. Users
            User admin = createUser("admin", "admin@dev.local", SEED_ADMIN_PASSWORD, "Admin User", Set.of(roleAdmin), null);
            User schoolUser = createUser("school1", "school@dev.local", SEED_SCHOOL_PASSWORD, "School Manager", Set.of(roleSchool), null);
            User teacher = createUser("teacher1", "teacher@dev.local", SEED_TEACHER_PASSWORD, "Teacher One", Set.of(roleTeacher), null);
            User student1 = createUser("student1", "student1@dev.local", SEED_STUDENT_PASSWORD, "Student One", Set.of(roleStudent), null);
            User student2 = createUser("student2", "student2@dev.local", SEED_STUDENT_PASSWORD, "Student Two", Set.of(roleStudent), null);

            admin = userRepository.save(admin);
            schoolUser = userRepository.save(schoolUser);
            teacher = userRepository.save(teacher);
            student1 = userRepository.save(student1);
            student2 = userRepository.save(student2);

            // 3. School
            School school = School.builder()
                    .name("Dev English School")
                    .address("123 Dev Street")
                    .phone("0123456789")
                    .email("contact@devschool.local")
                    .isActive(true)
                    .trialEndDate(LocalDate.now().plusMonths(1))
                    .build();
            school = schoolRepository.save(school);

            schoolUser.setSchool(school);
            userRepository.save(schoolUser);

            // 4. ClassRoom
            ClassRoom class1 = ClassRoom.builder()
                    .name("Lớp 10A")
                    .school(school)
                    .teacher(teacher)
                    .academicYear("2024-2025")
                    .isActive(true)
                    .build();
            class1 = classRoomRepository.save(class1);

            ClassRoom class2 = ClassRoom.builder()
                    .name("Lớp 10B")
                    .school(school)
                    .teacher(teacher)
                    .academicYear("2024-2025")
                    .isActive(true)
                    .build();
            class2 = classRoomRepository.save(class2);

            // 5. StudentClass
            saveStudentClass(student1, class1);
            saveStudentClass(student2, class1);
            saveStudentClass(student2, class2);

            // 6. Topic
            Topic topic = Topic.builder()
                    .name("Daily Life")
                    .description("Vocabulary and grammar for everyday situations")
                    .build();
            topic = topicRepository.save(topic);

            // 7. Lessons
            Lesson lesson1 = Lesson.builder()
                    .title("Greetings and Introductions")
                    .topic(topic)
                    .contentHtml("<p>Learn how to greet and introduce yourself.</p>")
                    .orderIndex(1)
                    .isPublished(true)
                    .build();
            lesson1 = lessonRepository.save(lesson1);

            Lesson lesson2 = Lesson.builder()
                    .title("Numbers and Time")
                    .topic(topic)
                    .contentHtml("<p>Numbers, dates and telling the time.</p>")
                    .orderIndex(2)
                    .isPublished(true)
                    .build();
            lesson2 = lessonRepository.save(lesson2);

            Lesson lesson3 = Lesson.builder()
                    .title("At the Shop")
                    .topic(topic)
                    .contentHtml("<p>Shopping and asking for prices.</p>")
                    .orderIndex(3)
                    .isPublished(true)
                    .build();
            lesson3 = lessonRepository.save(lesson3);

            // 8. Vocabulary
            saveVocabulary(lesson1, "Hello", "həˈloʊ", "Xin chào");
            saveVocabulary(lesson1, "Goodbye", "ɡʊdˈbaɪ", "Tạm biệt");
            saveVocabulary(lesson2, "Morning", "ˈmɔːrnɪŋ", "Buổi sáng");
            saveVocabulary(lesson2, "Evening", "ˈiːvnɪŋ", "Buổi tối");

            // 9. Question + QuestionOption
            Question q1 = saveQuestion(lesson1, "MULTIPLE_CHOICE", "What does 'Hello' mean?");
            saveOption(q1, "Xin chào", true);
            saveOption(q1, "Tạm biệt", false);
            saveOption(q1, "Cảm ơn", false);

            Question q2 = saveQuestion(lesson1, "TRUE_FALSE", "'Goodbye' means the same as 'Hello'.");
            saveOption(q2, "True", false);
            saveOption(q2, "False", true);

            Question q3 = saveQuestion(lesson2, "MULTIPLE_CHOICE", "Which word means 'Buổi sáng'?");
            saveOption(q3, "Evening", false);
            saveOption(q3, "Morning", true);
            saveOption(q3, "Night", false);

            List<Question> examQuestions = questionRepository.findByLessonId(lesson1.getId());
            examQuestions.addAll(questionRepository.findByLessonId(lesson2.getId()));
            Set<Question> questionSet = new HashSet<>(examQuestions);

            // 10. Exam (PUBLISHED, valid time window)
            LocalDateTime now = LocalDateTime.now();
            Exam exam = Exam.builder()
                    .title("Dev Test - Greetings & Time")
                    .teacher(teacher)
                    .classRoom(class1)
                    .startTime(now.minusDays(1))
                    .endTime(now.plusDays(7))
                    .durationMinutes(30)
                    .shuffleQuestions(true)
                    .shuffleAnswers(true)
                    .antiCheatEnabled(true)
                    .status("PUBLISHED")
                    .questions(questionSet)
                    .build();
            examRepository.save(exam);

            log.info("Dev data seeded successfully.");
            log.info("Seed accounts: admin (Admin@123), school1 (School@123), teacher1 (Teacher@123), student1/student2 (Student@123). See SWAGGER_TEST.md for usage.");
        };
    }

    private User createUser(String username, String email, String plainPassword, String fullName, Set<Role> roles, School school) {
        return User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(plainPassword))
                .fullName(fullName)
                .roles(roles)
                .school(school)
                .isActive(true)
                .coins(0)
                .streakDays(0)
                .build();
    }

    private void saveStudentClass(User student, ClassRoom classRoom) {
        if (studentClassRepository.existsByStudentAndClassRoom(student, classRoom)) return;
        StudentClass sc = StudentClass.builder()
                .student(student)
                .classRoom(classRoom)
                .status("ACTIVE")
                .build();
        studentClassRepository.save(sc);
    }

    private void saveVocabulary(Lesson lesson, String word, String pronunciation, String meaning) {
        Vocabulary v = Vocabulary.builder()
                .lesson(lesson)
                .word(word)
                .pronunciation(pronunciation)
                .meaning(meaning)
                .build();
        vocabularyRepository.save(v);
    }

    private Question saveQuestion(Lesson lesson, String questionType, String questionText) {
        Question q = Question.builder()
                .lesson(lesson)
                .questionType(questionType)
                .questionText(questionText)
                .points(1)
                .build();
        return questionRepository.save(q);
    }

    private void saveOption(Question question, String optionText, boolean isCorrect) {
        QuestionOption opt = QuestionOption.builder()
                .question(question)
                .optionText(optionText)
                .isCorrect(isCorrect)
                .build();
        questionOptionRepository.save(opt);
    }
}
