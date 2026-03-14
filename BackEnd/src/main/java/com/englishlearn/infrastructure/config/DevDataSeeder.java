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
 * Seeds realistic dev data (English Grade 6 - ILA curriculum) when running with
 * profile "dev".
 * Idempotent: skips if seed data already present.
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
                        try (java.io.PrintWriter writer = new java.io.PrintWriter(new java.io.FileWriter("db_debug.txt"))) {
                                writer.println("=== DIAGNOSTIC REPORT - " + LocalDateTime.now() + " ===");
                                
                                // 1. Check Roles
                                writer.println("\n--- ROLES ---");
                                List<Role> roles = roleRepository.findAll();
                                roles.forEach(r -> writer.println("ID: " + r.getId() + ", Name: " + r.getName()));
                                
                                // 2. Check Schools
                                writer.println("\n--- SCHOOLS ---");
                                List<School> schools = schoolRepository.findAll();
                                schools.forEach(s -> writer.println("ID: " + s.getId() + ", Name: " + s.getName()));
                                
                                if (schools.isEmpty()) {
                                    writer.println("WARNING: No schools found. Creating default school.");
                                    School defaultSchool = schoolRepository.save(School.builder()
                                        .name("Trường THCS Nguyễn Du")
                                        .isActive(true)
                                        .build());
                                    schools.add(defaultSchool);
                                }
                                School targetSchool = schools.get(0);

                                // 3. Check and Fix Users
                                writer.println("\n--- USERS & FIXES ---");
                                List<User> users = userRepository.findAll();
                                Role teacherRole = roleRepository.findByName(Role.TEACHER).orElse(null);
                                Role studentRole = roleRepository.findByName(Role.STUDENT).orElse(null);
                                Role schoolRole = roleRepository.findByName(Role.SCHOOL).orElse(null);

                                for (User u : users) {
                                    boolean changed = false;
                                    writer.print("User: " + u.getUsername() + " (ID: " + u.getId() + ")");
                                    
                                    // Fix School association
                                    if (u.getSchool() == null && !u.getUsername().equals("admin")) {
                                        u.setSchool(targetSchool);
                                        changed = true;
                                        writer.print(" | FIXED: Added School " + targetSchool.getId());
                                    }

                                    // Fix Roles based on username/email hints if empty
                                    if (u.getRoles().isEmpty()) {
                                        if (u.getUsername().contains("teacher") || u.getEmail().contains("teacher")) {
                                            if (teacherRole != null) u.getRoles().add(teacherRole);
                                        } else if (u.getUsername().contains("student") || u.getEmail().contains("student")) {
                                            if (studentRole != null) u.getRoles().add(studentRole);
                                        } else if (u.getUsername().contains("school") || u.getEmail().contains("school")) {
                                            if (schoolRole != null) u.getRoles().add(schoolRole);
                                        }
                                        if (!u.getRoles().isEmpty()) {
                                            changed = true;
                                            writer.print(" | FIXED: Added Roles " + u.getRoles().stream().map(Role::getName).toList());
                                        }
                                    }

                                    if (changed) {
                                        userRepository.save(u);
                                    }
                                    writer.println(" | Final Roles: " + u.getRoles().stream().map(Role::getName).toList() + 
                                                   " | School: " + (u.getSchool() != null ? u.getSchool().getId() : "NULL"));
                                }
                                
                                writer.println("\n=== END OF REPORT ===");
                        } catch (java.io.IOException e) {
                                log.error("Failed to write diagnostic report", e);
                        }

                        if (userRepository.findByUsername(SEED_ADMIN_USERNAME).isPresent()) {
                                log.info("Dev data present. Integrity check completed. Grammar backfill starting.");
                                backfillGrammarForExistingLessons();
                                return;
                        }

                        log.info("=== Seeding REAL English Grade 6 data (ILA curriculum) ===");

                        // ── 1. Roles ──
                        Role roleAdmin = roleRepository.findByName(Role.ADMIN).orElseThrow();
                        Role roleSchool = roleRepository.findByName(Role.SCHOOL).orElseThrow();
                        Role roleTeacher = roleRepository.findByName(Role.TEACHER).orElseThrow();
                        Role roleStudent = roleRepository.findByName(Role.STUDENT).orElseThrow();

                        // ── 2. School ──
                        School school = schoolRepository.save(School.builder()
                                        .name("Trường THCS Nguyễn Du")
                                        .address("123 Nguyễn Du, Quận 1, TP.HCM")
                                        .phone("028 1234 5678")
                                        .email("contact@nguyendu.edu.vn")
                                        .isActive(true)
                                        .trialEndDate(LocalDate.now().plusMonths(6))
                                        .build());

                        // ── 3. Users ──
                        User admin = userRepository.save(createUser("admin", "admin@school.edu.vn", SEED_ADMIN_PASSWORD,
                                        "Quản trị viên", Set.of(roleAdmin), null));
                        User schoolUser = userRepository.save(createUser("school1", "school@school.edu.vn",
                                        SEED_SCHOOL_PASSWORD, "Trường THCS Nguyễn Du", Set.of(roleSchool), school));
                        User teacher = userRepository.save(createUser("teacher1", "teacher@school.edu.vn",
                                        SEED_TEACHER_PASSWORD, "Nguyễn Thị Hương", Set.of(roleTeacher), school));
                        User student1 = userRepository.save(createUser("student1", "student1@school.edu.vn",
                                        SEED_STUDENT_PASSWORD, "Trần Minh Khoa", Set.of(roleStudent), school));
                        User student2 = userRepository.save(createUser("student2", "student2@school.edu.vn",
                                        SEED_STUDENT_PASSWORD, "Lê Thị Mai", Set.of(roleStudent), school));
                        User student3 = userRepository.save(createUser("student3", "student3@school.edu.vn",
                                        SEED_STUDENT_PASSWORD, "Phạm Văn Đức", Set.of(roleStudent), school));

                        // ── 4. ClassRooms ──
                        ClassRoom class6A = classRoomRepository.save(ClassRoom.builder()
                                        .name("Lớp 6A1").school(school).teacher(teacher)
                                        .academicYear("2025-2026").isActive(true).build());

                        ClassRoom class6B = classRoomRepository.save(ClassRoom.builder()
                                        .name("Lớp 6A2").school(school).teacher(teacher)
                                        .academicYear("2025-2026").isActive(true).build());

                        // ── 5. StudentClass ──
                        saveStudentClass(student1, class6A);
                        saveStudentClass(student2, class6A);
                        saveStudentClass(student3, class6A);
                        saveStudentClass(student2, class6B);
                        saveStudentClass(student3, class6B);

                        // ── 6. Topic ──
                        Topic topicHK1 = topicRepository.save(Topic.builder()
                                        .name("Tiếng Anh Lớp 6 - Học Kỳ I")
                                        .description("Chương trình Tiếng Anh lớp 6 theo SGK mới, học kỳ I gồm 6 đơn vị bài học với các chủ đề: trường học, nhà cửa, bạn bè, khu phố, kỳ quan thiên nhiên, và Tết Nguyên Đán.")
                                        .build());

                        // ═══════════════════════════════════════════════
                        // ── 7. LESSON 1: My New School ──
                        // ═══════════════════════════════════════════════
                        Lesson lesson1 = lessonRepository.save(Lesson.builder()
                                        .title("Unit 1: My New School")
                                        .topic(topicHK1)
                                        .contentHtml("<h2>My New School - Ngôi trường mới của tôi</h2>"
                                                        + "<p>Trong bài học này, các em sẽ học từ vựng về trường học, các vật dụng học tập "
                                                        + "và cách giới thiệu về ngôi trường của mình bằng tiếng Anh.</p>"
                                                        + "<h3>Grammar Focus</h3>"
                                                        + "<ul><li>Present Simple Tense</li><li>Prepositions of place</li></ul>")
                                        .grammarHtml(grammarHtmlForUnit(1))
                                        .difficultyLevel(1).orderIndex(1).isPublished(true).build());

                        saveVocab(lesson1, "boarding school", "/ˈbɔːdɪŋ skuːl/", "trường nội trú (n)",
                                        "She studies at a boarding school in Da Lat.");
                        saveVocab(lesson1, "principal", "/ˈprɪn.sɪ.pəl/", "hiệu trưởng (n)",
                                        "The principal gave a speech at the ceremony.");
                        saveVocab(lesson1, "teacher", "/ˈtiːtʃə(r)/", "giáo viên (n)",
                                        "My English teacher is very kind.");
                        saveVocab(lesson1, "classmate", "/ˈklɑːsmeɪt/", "bạn cùng lớp (n)",
                                        "I have 40 classmates in my class.");
                        saveVocab(lesson1, "student", "/ˈstjuːdənt/", "học sinh (n)",
                                        "There are 500 students in my school.");
                        saveVocab(lesson1, "school supply", "/ˈskuːl səˈplaɪ/", "dụng cụ học tập (n)",
                                        "I need to buy some school supplies.");
                        saveVocab(lesson1, "pencil sharpener", "/ˈpensl ˈʃɑːpənər/", "gọt bút chì (n)",
                                        "Can I borrow your pencil sharpener?");
                        saveVocab(lesson1, "rubber", "/ˈrʌb.ər/", "cục tẩy (n)",
                                        "I made a mistake, give me a rubber please.");
                        saveVocab(lesson1, "calculator", "/ˈkælkjuleɪtə(r)/", "máy tính (n)",
                                        "We use a calculator in Math class.");
                        saveVocab(lesson1, "compass", "/ˈkʌmpəs/", "com-pa (n)", "I need a compass to draw a circle.");
                        saveVocab(lesson1, "uniform", "/ˈjuːnɪfɔːm/", "đồng phục (n)",
                                        "Students wear uniform every day.");

                        // Questions for Lesson 1
                        Question q1_1 = saveQuestion(lesson1, "MULTIPLE_CHOICE",
                                        "What does 'boarding school' mean in Vietnamese?");
                        saveOption(q1_1, "Trường nội trú", true);
                        saveOption(q1_1, "Trường công lập", false);
                        saveOption(q1_1, "Trường quốc tế", false);
                        saveOption(q1_1, "Trường dân lập", false);

                        Question q1_2 = saveQuestion(lesson1, "MULTIPLE_CHOICE",
                                        "The person who leads a school is called a ___.");
                        saveOption(q1_2, "teacher", false);
                        saveOption(q1_2, "student", false);
                        saveOption(q1_2, "principal", true);
                        saveOption(q1_2, "classmate", false);

                        Question q1_3 = saveQuestion(lesson1, "TRUE_FALSE",
                                        "'Uniform' means 'đồng phục' in Vietnamese.");
                        saveOption(q1_3, "True", true);
                        saveOption(q1_3, "False", false);

                        Question q1_4 = saveQuestion(lesson1, "MULTIPLE_CHOICE", "Which of these is a school supply?");
                        saveOption(q1_4, "Calculator", true);
                        saveOption(q1_4, "Kitchen", false);
                        saveOption(q1_4, "Bedroom", false);
                        saveOption(q1_4, "Garden", false);

                        // ═══════════════════════════════════════════════
                        // ── 8. LESSON 2: My House ──
                        // ═══════════════════════════════════════════════
                        Lesson lesson2 = lessonRepository.save(Lesson.builder()
                                        .title("Unit 2: My House")
                                        .topic(topicHK1)
                                        .contentHtml("<h2>My House - Ngôi nhà của tôi</h2>"
                                                        + "<p>Bài học này giúp các em mô tả ngôi nhà, các phòng và đồ vật trong nhà bằng tiếng Anh.</p>"
                                                        + "<h3>Grammar Focus</h3>"
                                                        + "<ul><li>There is / There are</li><li>Prepositions of place: in, on, under, behind</li></ul>")
                                        .grammarHtml(grammarHtmlForUnit(2))
                                        .difficultyLevel(1).orderIndex(2).isPublished(true).build());

                        saveVocab(lesson2, "country house", "/ˌkʌn.tri ˈhaʊs/", "nhà ở nông thôn (n)",
                                        "My grandparents live in a country house.");
                        saveVocab(lesson2, "stilt house", "/stɪltsˌhaʊs/", "nhà sàn (n)",
                                        "Stilt houses are common in the mountains.");
                        saveVocab(lesson2, "villa", "/ˈvɪl.ə/", "biệt thự (n)",
                                        "They live in a beautiful villa by the beach.");
                        saveVocab(lesson2, "attic", "/ˈæt.ɪk/", "gác mái (n)", "We keep old things in the attic.");
                        saveVocab(lesson2, "air conditioner", "/ˈeər kənˌdɪʃ.ə.nər/", "máy điều hòa (n)",
                                        "Please turn on the air conditioner, it's hot.");
                        saveVocab(lesson2, "chest of drawers", "/ˌtʃest əv ˈdrɔːrz/", "ngăn kéo tủ (n)",
                                        "Put your clothes in the chest of drawers.");
                        saveVocab(lesson2, "dishwasher", "/ˈdɪʃˌwɒʃ.ər/", "máy rửa bát (n)",
                                        "The dishwasher makes housework easier.");
                        saveVocab(lesson2, "microwave", "/ˈmaɪ.kroʊ.weɪv/", "lò vi sóng (n)",
                                        "I heated my food in the microwave.");
                        saveVocab(lesson2, "wardrobe", "/ˈwɔːrdroʊb/", "tủ quần áo (n)",
                                        "My wardrobe is full of clothes.");

                        // Questions for Lesson 2
                        Question q2_1 = saveQuestion(lesson2, "MULTIPLE_CHOICE", "'Nhà sàn' in English is ___.");
                        saveOption(q2_1, "country house", false);
                        saveOption(q2_1, "stilt house", true);
                        saveOption(q2_1, "villa", false);
                        saveOption(q2_1, "apartment", false);

                        Question q2_2 = saveQuestion(lesson2, "MULTIPLE_CHOICE", "Where do you keep your clothes?");
                        saveOption(q2_2, "Dishwasher", false);
                        saveOption(q2_2, "Microwave", false);
                        saveOption(q2_2, "Wardrobe", true);
                        saveOption(q2_2, "Attic", false);

                        Question q2_3 = saveQuestion(lesson2, "TRUE_FALSE",
                                        "A 'villa' is a small apartment in the city.");
                        saveOption(q2_3, "True", false);
                        saveOption(q2_3, "False", true);

                        Question q2_4 = saveQuestion(lesson2, "MULTIPLE_CHOICE",
                                        "Which appliance is used to wash dishes automatically?");
                        saveOption(q2_4, "Air conditioner", false);
                        saveOption(q2_4, "Microwave", false);
                        saveOption(q2_4, "Dishwasher", true);
                        saveOption(q2_4, "Wardrobe", false);

                        // ═══════════════════════════════════════════════
                        // ── 9. LESSON 3: My Friends ──
                        // ═══════════════════════════════════════════════
                        Lesson lesson3 = lessonRepository.save(Lesson.builder()
                                        .title("Unit 3: My Friends")
                                        .topic(topicHK1)
                                        .contentHtml("<h2>My Friends - Những người bạn của tôi</h2>"
                                                        + "<p>Học cách mô tả ngoại hình và tính cách bạn bè bằng tiếng Anh.</p>"
                                                        + "<h3>Grammar Focus</h3>"
                                                        + "<ul><li>Present Continuous Tense</li><li>Adjectives for appearance and personality</li></ul>")
                                        .grammarHtml(grammarHtmlForUnit(3))
                                        .difficultyLevel(1).orderIndex(3).isPublished(true).build());

                        saveVocab(lesson3, "appearance", "/əˈpɪər.əns/", "ngoại hình (n)",
                                        "Don't judge people by their appearance.");
                        saveVocab(lesson3, "chubby", "/ˈtʃʌb.i/", "phúng phính (adj)", "The baby has chubby cheeks.");
                        saveVocab(lesson3, "creative", "/kriˈeɪ.tɪv/", "sáng tạo (adj)",
                                        "She is very creative in art class.");
                        saveVocab(lesson3, "generous", "/ˈdʒen.ə.rəs/", "hào phóng (adj)",
                                        "My friend is generous, she always shares.");
                        saveVocab(lesson3, "patient", "/ˈpeɪ.ʃənt/", "kiên nhẫn (adj)",
                                        "A good teacher must be patient.");
                        saveVocab(lesson3, "talkative", "/ˈtɔː.kə.tɪv/", "hay nói (adj)",
                                        "My sister is very talkative.");
                        saveVocab(lesson3, "hard-working", "/ˌhɑːrdˈwɜː.kɪŋ/", "chăm chỉ (adj)",
                                        "He is a hard-working student.");
                        saveVocab(lesson3, "ponytail", "/ˈpoʊ.ni.teɪl/", "tóc đuôi ngựa (n)",
                                        "She always wears her hair in a ponytail.");

                        // Questions for Lesson 3
                        Question q3_1 = saveQuestion(lesson3, "MULTIPLE_CHOICE",
                                        "Someone who likes to talk a lot is ___.");
                        saveOption(q3_1, "patient", false);
                        saveOption(q3_1, "creative", false);
                        saveOption(q3_1, "talkative", true);
                        saveOption(q3_1, "generous", false);

                        Question q3_2 = saveQuestion(lesson3, "MULTIPLE_CHOICE", "'Chăm chỉ' in English is ___.");
                        saveOption(q3_2, "creative", false);
                        saveOption(q3_2, "hard-working", true);
                        saveOption(q3_2, "chubby", false);
                        saveOption(q3_2, "generous", false);

                        Question q3_3 = saveQuestion(lesson3, "TRUE_FALSE",
                                        "'Generous' means 'kiên nhẫn' in Vietnamese.");
                        saveOption(q3_3, "True", false);
                        saveOption(q3_3, "False", true);

                        Question q3_4 = saveQuestion(lesson3, "MULTIPLE_CHOICE",
                                        "Which word describes a person's outer look?");
                        saveOption(q3_4, "Appearance", true);
                        saveOption(q3_4, "Patient", false);
                        saveOption(q3_4, "Talkative", false);
                        saveOption(q3_4, "Hard-working", false);

                        // ═══════════════════════════════════════════════
                        // ── 10. LESSON 4: My Neighborhood ──
                        // ═══════════════════════════════════════════════
                        Lesson lesson4 = lessonRepository.save(Lesson.builder()
                                        .title("Unit 4: My Neighborhood")
                                        .topic(topicHK1)
                                        .contentHtml("<h2>My Neighborhood - Khu phố của tôi</h2>"
                                                        + "<p>Học cách mô tả các địa điểm và đặc điểm khu phố nơi em sống.</p>"
                                                        + "<h3>Grammar Focus</h3>"
                                                        + "<ul><li>Comparative adjectives</li><li>Superlative adjectives</li></ul>")
                                        .grammarHtml(grammarHtmlForUnit(4))
                                        .difficultyLevel(2).orderIndex(4).isPublished(true).build());

                        saveVocab(lesson4, "cathedral", "/kəˈθiːdrəl/", "nhà thờ lớn (n)",
                                        "The cathedral is in the city center.");
                        saveVocab(lesson4, "convenient", "/kənˈviːniənt/", "thuận tiện (adj)",
                                        "Living here is very convenient.");
                        saveVocab(lesson4, "historic", "/hɪˈstɒrɪk/", "cổ kính (adj)", "Hoi An is a historic town.");
                        saveVocab(lesson4, "polluted", "/pəˈluːtɪd/", "ô nhiễm (adj)",
                                        "The river is polluted with waste.");
                        saveVocab(lesson4, "railway station", "/ˈreɪl.weɪ ˌsteɪ.ʃən/", "nhà ga xe lửa (n)",
                                        "The railway station is near my house.");
                        saveVocab(lesson4, "art gallery", "/ˈɑːt ˌɡæl.ər.i/", "triển lãm nghệ thuật (n)",
                                        "We visited the art gallery last Sunday.");
                        saveVocab(lesson4, "memorial", "/məˈmɔː.ri.əl/", "đài tưởng niệm (n)",
                                        "There is a war memorial in the park.");

                        // Questions for Lesson 4
                        Question q4_1 = saveQuestion(lesson4, "MULTIPLE_CHOICE",
                                        "A place where you can see paintings and sculptures is an ___.");
                        saveOption(q4_1, "railway station", false);
                        saveOption(q4_1, "cathedral", false);
                        saveOption(q4_1, "art gallery", true);
                        saveOption(q4_1, "memorial", false);

                        Question q4_2 = saveQuestion(lesson4, "TRUE_FALSE",
                                        "'Polluted' means 'thuận tiện' in Vietnamese.");
                        saveOption(q4_2, "True", false);
                        saveOption(q4_2, "False", true);

                        Question q4_3 = saveQuestion(lesson4, "MULTIPLE_CHOICE", "'Nhà thờ lớn' in English is ___.");
                        saveOption(q4_3, "memorial", false);
                        saveOption(q4_3, "cathedral", true);
                        saveOption(q4_3, "art gallery", false);
                        saveOption(q4_3, "railway station", false);

                        // ═══════════════════════════════════════════════
                        // ── 11. LESSON 5: Natural Wonders of the World ──
                        // ═══════════════════════════════════════════════
                        Lesson lesson5 = lessonRepository.save(Lesson.builder()
                                        .title("Unit 5: Natural Wonders of the World")
                                        .topic(topicHK1)
                                        .contentHtml("<h2>Natural Wonders of the World - Kỳ quan thiên nhiên thế giới</h2>"
                                                        + "<p>Khám phá các kỳ quan thiên nhiên và học từ vựng về du lịch, thiên nhiên.</p>"
                                                        + "<h3>Grammar Focus</h3>"
                                                        + "<ul><li>Must / Mustn't</li><li>Countable and Uncountable nouns</li></ul>")
                                        .grammarHtml(grammarHtmlForUnit(5))
                                        .difficultyLevel(2).orderIndex(5).isPublished(true).build());

                        saveVocab(lesson5, "desert", "/ˈdez.ət/", "sa mạc (n)",
                                        "The Sahara is the largest desert in the world.");
                        saveVocab(lesson5, "waterfall", "/ˈwɔː.tər.fɔːl/", "thác nước (n)",
                                        "Ban Gioc is a famous waterfall in Vietnam.");
                        saveVocab(lesson5, "rainforest", "/ˈreɪn.fɒr.ɪst/", "rừng nhiệt đới (n)",
                                        "The Amazon rainforest is very large.");
                        saveVocab(lesson5, "hiking", "/ˈhaɪ.kɪŋ/", "đi bộ đường dài (n/v)",
                                        "We went hiking in the mountains last weekend.");
                        saveVocab(lesson5, "suncream", "/ˈsʌn.kriːm/", "kem chống nắng (n)",
                                        "Don't forget to bring suncream to the beach.");
                        saveVocab(lesson5, "sleeping bag", "/ˈsliː.pɪŋ ˌbæɡ/", "túi ngủ (n)",
                                        "You need a sleeping bag for camping.");
                        saveVocab(lesson5, "plaster", "/ˈplæs.tər/", "băng dán vết thương (n)",
                                        "Put a plaster on the cut.");

                        // Questions for Lesson 5
                        Question q5_1 = saveQuestion(lesson5, "MULTIPLE_CHOICE",
                                        "A very dry area with sand and little water is a ___.");
                        saveOption(q5_1, "rainforest", false);
                        saveOption(q5_1, "waterfall", false);
                        saveOption(q5_1, "desert", true);
                        saveOption(q5_1, "island", false);

                        Question q5_2 = saveQuestion(lesson5, "MULTIPLE_CHOICE",
                                        "What do you use to protect your skin from the sun?");
                        saveOption(q5_2, "Sleeping bag", false);
                        saveOption(q5_2, "Plaster", false);
                        saveOption(q5_2, "Suncream", true);
                        saveOption(q5_2, "Compass", false);

                        Question q5_3 = saveQuestion(lesson5, "TRUE_FALSE",
                                        "A 'waterfall' is water that falls from a high place. (Thác nước)");
                        saveOption(q5_3, "True", true);
                        saveOption(q5_3, "False", false);

                        // ═══════════════════════════════════════════════
                        // ── 12. LESSON 6: Our Tet Holiday ──
                        // ═══════════════════════════════════════════════
                        Lesson lesson6 = lessonRepository.save(Lesson.builder()
                                        .title("Unit 6: Our Tet Holiday")
                                        .topic(topicHK1)
                                        .contentHtml("<h2>Our Tet Holiday - Kỳ nghỉ Tết của chúng tôi</h2>"
                                                        + "<p>Tìm hiểu từ vựng liên quan đến Tết Nguyên Đán - ngày lễ truyền thống quan trọng nhất của Việt Nam.</p>"
                                                        + "<h3>Grammar Focus</h3>"
                                                        + "<ul><li>Should / Shouldn't</li><li>Will for predictions</li></ul>")
                                        .grammarHtml(grammarHtmlForUnit(6))
                                        .difficultyLevel(2).orderIndex(6).isPublished(true).build());

                        saveVocab(lesson6, "family gathering", "/ˈfæməli ˈɡæðərɪŋ/", "sum họp gia đình (n)",
                                        "Tet is a time for family gatherings.");
                        saveVocab(lesson6, "peach blossom", "/piːtʃ ˈblɒs.əm/", "hoa đào (n)",
                                        "People in the North buy peach blossoms for Tet.");
                        saveVocab(lesson6, "apricot blossom", "/ˈeɪ.prɪ.kɒt ˈblɒs.əm/", "hoa mai (n)",
                                        "Apricot blossoms are popular in Southern Vietnam.");
                        saveVocab(lesson6, "lucky money", "/ˈlʌk.i ˈmʌn.i/", "tiền lì xì (n)",
                                        "Children receive lucky money during Tet.");
                        saveVocab(lesson6, "New Year's Eve", "/ˌnjuː jɪəz ˈiːv/", "giao thừa (n)",
                                        "We stay up late on New Year's Eve.");
                        saveVocab(lesson6, "fireworks", "/ˈfaɪə.wɜːks/", "pháo hoa (n)",
                                        "There are beautiful fireworks on New Year's Eve.");
                        saveVocab(lesson6, "first footing", "/ˈfɜːst ˈfʊt.ɪŋ/", "xông đất (n)",
                                        "First footing is a Tet tradition in Vietnam.");

                        // Questions for Lesson 6
                        Question q6_1 = saveQuestion(lesson6, "MULTIPLE_CHOICE",
                                        "What do children receive from adults during Tet?");
                        saveOption(q6_1, "Fireworks", false);
                        saveOption(q6_1, "Lucky money", true);
                        saveOption(q6_1, "Peach blossom", false);
                        saveOption(q6_1, "First footing", false);

                        Question q6_2 = saveQuestion(lesson6, "MULTIPLE_CHOICE", "'Hoa mai' in English is ___.");
                        saveOption(q6_2, "peach blossom", false);
                        saveOption(q6_2, "apricot blossom", true);
                        saveOption(q6_2, "fireworks", false);
                        saveOption(q6_2, "sunflower", false);

                        Question q6_3 = saveQuestion(lesson6, "TRUE_FALSE",
                                        "'Giao thừa' in English is 'New Year's Eve'.");
                        saveOption(q6_3, "True", true);
                        saveOption(q6_3, "False", false);

                        // ═══════════════════════════════════════════════
                        // ── 13. EXAMS ──
                        // ═══════════════════════════════════════════════
                        LocalDateTime now = LocalDateTime.now();

                        // Exam 1: Unit 1-2
                        List<Question> exam1Questions = questionRepository.findByLessonId(lesson1.getId());
                        exam1Questions.addAll(questionRepository.findByLessonId(lesson2.getId()));
                        examRepository.save(Exam.builder()
                                        .title("Kiểm tra 15 phút - Unit 1 & 2: School & House")
                                        .teacher(teacher).classRoom(class6A)
                                        .startTime(now.minusDays(1)).endTime(now.plusDays(14))
                                        .durationMinutes(15)
                                        .shuffleQuestions(true).shuffleAnswers(true).antiCheatEnabled(true)
                                        .status("PUBLISHED")
                                        .questions(new HashSet<>(exam1Questions))
                                        .build());

                        // Exam 2: Unit 3-4
                        List<Question> exam2Questions = questionRepository.findByLessonId(lesson3.getId());
                        exam2Questions.addAll(questionRepository.findByLessonId(lesson4.getId()));
                        examRepository.save(Exam.builder()
                                        .title("Kiểm tra 15 phút - Unit 3 & 4: Friends & Neighborhood")
                                        .teacher(teacher).classRoom(class6A)
                                        .startTime(now.minusDays(1)).endTime(now.plusDays(14))
                                        .durationMinutes(15)
                                        .shuffleQuestions(true).shuffleAnswers(true).antiCheatEnabled(true)
                                        .status("PUBLISHED")
                                        .questions(new HashSet<>(exam2Questions))
                                        .build());

                        // Exam 3: Mid-term (all units)
                        List<Question> midtermQuestions = questionRepository.findByLessonId(lesson1.getId());
                        midtermQuestions.addAll(questionRepository.findByLessonId(lesson2.getId()));
                        midtermQuestions.addAll(questionRepository.findByLessonId(lesson3.getId()));
                        midtermQuestions.addAll(questionRepository.findByLessonId(lesson4.getId()));
                        midtermQuestions.addAll(questionRepository.findByLessonId(lesson5.getId()));
                        midtermQuestions.addAll(questionRepository.findByLessonId(lesson6.getId()));
                        examRepository.save(Exam.builder()
                                        .title("Kiểm tra Giữa Kỳ I - Tiếng Anh 6")
                                        .teacher(teacher).classRoom(class6A)
                                        .startTime(now.minusDays(1)).endTime(now.plusDays(30))
                                        .durationMinutes(45)
                                        .shuffleQuestions(true).shuffleAnswers(true).antiCheatEnabled(true)
                                        .status("PUBLISHED")
                                        .questions(new HashSet<>(midtermQuestions))
                                        .build());

                        // Give students some coins for testing
                        student1.setCoins(150);
                        student1.setStreakDays(5);
                        userRepository.save(student1);

                        student2.setCoins(80);
                        student2.setStreakDays(3);
                        userRepository.save(student2);

                        log.info("=== Dev data seeded successfully! ===");
                        log.info("Accounts: admin (Admin@123), school1 (School@123), teacher1 (Teacher@123), student1/2/3 (Student@123)");
                        log.info("Data: 6 Lessons, 49 Vocabulary items, 21 Questions, 3 Exams");
                };
        }

        private User createUser(String username, String email, String plainPassword, String fullName, Set<Role> roles,
                        School school) {
                return User.builder()
                                .username(username).email(email)
                                .passwordHash(passwordEncoder.encode(plainPassword))
                                .fullName(fullName).roles(roles).school(school)
                                .isActive(true).coins(0).streakDays(0)
                                .build();
        }

        private void backfillGrammarForExistingLessons() {
                List<Lesson> lessons = lessonRepository.findAll();
                int updated = 0;
                for (Lesson lesson : lessons) {
                        Integer orderIndex = lesson.getOrderIndex();
                        if (orderIndex == null || orderIndex < 1 || orderIndex > 6) {
                                continue;
                        }
                        String grammarHtml = grammarHtmlForUnit(orderIndex);
                        if (grammarHtml.equals(lesson.getGrammarHtml())) {
                                continue;
                        }
                        lesson.setGrammarHtml(grammarHtml);
                        lessonRepository.save(lesson);
                        updated++;
                }
                log.info("Backfilled grammarHtml for {} lessons.", updated);
        }

        private String grammarHtmlForUnit(int unit) {
                return switch (unit) {
                        case 1 -> "<h3>Grammar Focus: Present Simple & Prepositions of Place</h3>"
                                        + "<p><strong>Present Simple</strong> dùng để nói thói quen, sự thật hiển nhiên.</p>"
                                        + "<ul>"
                                        + "<li><strong>Khẳng định:</strong> S + V(s/es). Ví dụ: <em>She studies at Nguyen Du school.</em></li>"
                                        + "<li><strong>Phủ định:</strong> S + do/does not + V. Ví dụ: <em>He does not go to school on Sunday.</em></li>"
                                        + "<li><strong>Nghi vấn:</strong> Do/Does + S + V? Ví dụ: <em>Do you wear uniform every day?</em></li>"
                                        + "</ul>"
                                        + "<p><strong>Prepositions of place:</strong> in, on, under, behind, next to.</p>"
                                        + "<p>Ví dụ: <em>The ruler is on the desk.</em></p>";
                        case 2 -> "<h3>Grammar Focus: There is / There are</h3>"
                                        + "<ul>"
                                        + "<li><strong>There is + danh từ số ít:</strong> <em>There is a TV in the living room.</em></li>"
                                        + "<li><strong>There are + danh từ số nhiều:</strong> <em>There are two bedrooms in my house.</em></li>"
                                        + "<li><strong>Nghi vấn:</strong> Is there...? / Are there...?</li>"
                                        + "</ul>"
                                        + "<p><strong>Prepositions in the house:</strong> in, on, under, behind, between, opposite.</p>"
                                        + "<p>Ví dụ: <em>The lamp is next to the bed.</em></p>";
                        case 3 -> "<h3>Grammar Focus: Present Continuous</h3>"
                                        + "<p>Dùng để diễn tả hành động đang diễn ra tại thời điểm nói.</p>"
                                        + "<ul>"
                                        + "<li><strong>Khẳng định:</strong> S + am/is/are + V-ing. <em>They are playing football.</em></li>"
                                        + "<li><strong>Phủ định:</strong> S + am/is/are not + V-ing.</li>"
                                        + "<li><strong>Nghi vấn:</strong> Am/Is/Are + S + V-ing?</li>"
                                        + "</ul>"
                                        + "<p><strong>Adjectives</strong> mô tả người: friendly, hard-working, talkative, shy...</p>"
                                        + "<p>Ví dụ: <em>My friend is very hard-working.</em></p>";
                        case 4 -> "<h3>Grammar Focus: Comparative & Superlative Adjectives</h3>"
                                        + "<ul>"
                                        + "<li><strong>So sánh hơn:</strong> adj + er + than / more + adj + than. <em>This street is quieter than that one.</em></li>"
                                        + "<li><strong>So sánh nhất:</strong> the + adj + est / the most + adj. <em>It is the most convenient place.</em></li>"
                                        + "</ul>"
                                        + "<p><strong>Lưu ý:</strong> good → better → best; bad → worse → worst.</p>";
                        case 5 -> "<h3>Grammar Focus: Must / Mustn't & Countable/Uncountable Nouns</h3>"
                                        + "<ul>"
                                        + "<li><strong>Must</strong>: phải làm. <em>You must wear a helmet.</em></li>"
                                        + "<li><strong>Mustn't</strong>: cấm làm. <em>You mustn't litter.</em></li>"
                                        + "</ul>"
                                        + "<p><strong>Danh từ đếm được:</strong> a waterfall, two islands.</p>"
                                        + "<p><strong>Danh từ không đếm được:</strong> water, sand, information.</p>"
                                        + "<p>Dùng <strong>some/any, much/many</strong> đúng loại danh từ.</p>";
                        case 6 -> "<h3>Grammar Focus: Should / Shouldn't & Will</h3>"
                                        + "<ul>"
                                        + "<li><strong>Should</strong>: lời khuyên nên làm. <em>You should visit your grandparents.</em></li>"
                                        + "<li><strong>Shouldn't</strong>: không nên làm. <em>You shouldn't say bad words on New Year's Day.</em></li>"
                                        + "<li><strong>Will</strong> cho dự đoán tương lai: <em>It will be a lucky year.</em></li>"
                                        + "</ul>"
                                        + "<p>Công thức: <strong>S + will + V</strong> / <strong>S + will not (won't) + V</strong>.</p>";
                        default -> "";
                };
        }

        private void saveStudentClass(User student, ClassRoom classRoom) {
                if (studentClassRepository.existsByStudentAndClassRoom(student, classRoom))
                        return;
                studentClassRepository.save(StudentClass.builder()
                                .student(student).classRoom(classRoom).status("ACTIVE").build());
        }

        private void saveVocab(Lesson lesson, String word, String pronunciation, String meaning, String example) {
                vocabularyRepository.save(Vocabulary.builder()
                                .lesson(lesson).word(word).pronunciation(pronunciation)
                                .meaning(meaning).exampleSentence(example).build());
        }

        private Question saveQuestion(Lesson lesson, String questionType, String questionText) {
                return questionRepository.save(Question.builder()
                                .lesson(lesson).questionType(questionType)
                                .questionText(questionText).points(1).build());
        }

        private void saveOption(Question question, String optionText, boolean isCorrect) {
                questionOptionRepository.save(QuestionOption.builder()
                                .question(question).optionText(optionText).isCorrect(isCorrect).build());

                // Auto-link question -> vocabulary from the correct option for deterministic mistake tracking.
                if (isCorrect && question.getVocabulary() == null && question.getLesson() != null) {
                        vocabularyRepository
                                        .findByLessonIdAndWordOrMeaningIgnoreCase(question.getLesson().getId(), optionText)
                                        .ifPresent(vocabulary -> {
                                                question.setVocabulary(vocabulary);
                                                questionRepository.save(question);
                                        });
                }
        }
}
