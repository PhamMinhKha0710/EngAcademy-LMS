package com.englishlearn.infrastructure.config;

import com.englishlearn.domain.entity.ClassRoom;
import com.englishlearn.domain.entity.Exam;
import com.englishlearn.domain.entity.Lesson;
import com.englishlearn.domain.entity.PlacementQuestion;
import com.englishlearn.domain.entity.Question;
import com.englishlearn.domain.entity.QuestionOption;
import com.englishlearn.domain.entity.Role;
import com.englishlearn.domain.entity.School;
import com.englishlearn.domain.entity.Topic;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.entity.Vocabulary;
import com.englishlearn.domain.enums.CefrLevel;
import com.englishlearn.domain.enums.PlacementSkill;
import com.englishlearn.infrastructure.persistence.ClassRoomRepository;
import com.englishlearn.infrastructure.persistence.ExamRepository;
import com.englishlearn.infrastructure.persistence.LessonRepository;
import com.englishlearn.infrastructure.persistence.QuestionOptionRepository;
import com.englishlearn.infrastructure.persistence.QuestionRepository;
import com.englishlearn.infrastructure.persistence.PlacementQuestionRepository;
import com.englishlearn.infrastructure.persistence.RoleRepository;
import com.englishlearn.infrastructure.persistence.SchoolRepository;
import com.englishlearn.infrastructure.persistence.TopicRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import com.englishlearn.infrastructure.persistence.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Seed tối thiểu cho môi trường production.
 *
 * - Đảm bảo các Role cốt lõi tồn tại.
 * - Seed bộ bài học/vocabulary/câu hỏi Tiếng Anh 6 (12 Unit) dùng làm dữ liệu thật.
 * - KHÔNG tạo bất kỳ user, school, classroom, exam hay coins demo nào.
 *   (Không bật profile "dev" trên production để {@link DevDataSeeder} không chạy.)
 */
@Slf4j
@Configuration
@Profile("prod")
@RequiredArgsConstructor
public class ProdDataSeeder {

    private final RoleRepository roleRepository;
    private final SchoolRepository schoolRepository;
    private final ClassRoomRepository classRoomRepository;
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;
    private final VocabularyRepository vocabularyRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final ExamRepository examRepository;
    private final UserRepository userRepository;
    private final PlacementQuestionRepository placementQuestionRepo;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner prodSeedData() {
        return args -> {
            log.info("Running ProdDataSeeder: ensuring core roles and curriculum exist (no demo users will be created).");

            seedCoreRoles();
            seedDefaultAdmin();

            if (lessonRepository.count() > 0) {
                log.info("Lessons already exist. Skipping curriculum seeding on production.");
                if (placementQuestionRepo.count() == 0) {
                    seedPlacementQuestions();
                }
                return;
            }

            seedGrade6Curriculum();
            if (placementQuestionRepo.count() == 0) {
                seedPlacementQuestions();
            }

            log.info("ProdDataSeeder completed. Core roles and Grade 6 curriculum are present.");
        };
    }

    private void seedPlacementQuestions() {
        log.info("Seeding minimal Placement Questions for production...");
        for (CefrLevel level : CefrLevel.values()) {
            // GRAMMAR
            savePQ(PlacementSkill.GRAMMAR, level, "Choose the correct grammar form for level " + level.name(), "Option A", "Option A", "Option B", "Option C", "Option D");
            savePQ(PlacementSkill.GRAMMAR, level, "Which sentence is correct? (" + level.name() + ")", "Option C", "Option A", "Option B", "Option C", "Option D");
            // VOCABULARY
            savePQ(PlacementSkill.VOCABULARY, level, "Choose the correct word for level " + level.name(), "Option B", "Option A", "Option B", "Option C", "Option D");
            savePQ(PlacementSkill.VOCABULARY, level, "What does this word mean? (" + level.name() + ")", "Option D", "Option A", "Option B", "Option C", "Option D");
            // READING
            savePQ(PlacementSkill.READING, level, "Read the text and answer for level " + level.name(), "Option A", "Option A", "Option B", "Option C", "Option D");
            savePQ(PlacementSkill.READING, level, "What is the main idea? (" + level.name() + ")", "Option C", "Option A", "Option B", "Option C", "Option D");
            // LISTENING
            savePQ(PlacementSkill.LISTENING, level, "Listen and choose the correct answer for level " + level.name(), "Option B", "Option A", "Option B", "Option C", "Option D");
            savePQ(PlacementSkill.LISTENING, level, "What did the speaker say? (" + level.name() + ")", "Option D", "Option A", "Option B", "Option C", "Option D");
        }
        log.info("Placement questions seeded.");
    }

    private void savePQ(PlacementSkill skill, CefrLevel level, String text, String correct, String a, String b, String c, String d) {
        placementQuestionRepo.save(PlacementQuestion.builder()
                .skill(skill)
                .cefrBand(level)
                .questionText(text)
                .correctAnswer(correct)
                .optionA(a)
                .optionB(b)
                .optionC(c)
                .optionD(d)
                .isActive(true)
                .build());
    }

    private void seedCoreRoles() {
        List<String> requiredRoles = List.of(
                Role.ADMIN,
                Role.SCHOOL,
                Role.TEACHER,
                Role.STUDENT
        );

        for (String roleName : requiredRoles) {
            roleRepository.findByName(roleName).orElseGet(() -> {
                log.info("Creating missing role: {}", roleName);
                return roleRepository.save(Role.builder()
                        .name(roleName)
                        .build());
            });
        }
    }

    private void seedDefaultAdmin() {
        if (userRepository.findByUsername("admin").isPresent()) {
            log.info("Admin user already exists. Skipping.");
            return;
        }
        Role adminRole = roleRepository.findByName(Role.ADMIN).orElse(null);
        User admin = User.builder()
                .username("admin")
                .email("admin@engacademy.vn")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .fullName("Administrator")
                .coins(100)
                .streakDays(0)
                .isActive(true)
                .roles(adminRole != null ? Set.of(adminRole) : Set.of())
                .build();
        userRepository.save(admin);
        log.info("Default admin user created: username=admin, password=Admin@123");
    }

    /**
     * Seed toàn bộ chương trình Tiếng Anh 6 (12 Unit) cho production,
     * chỉ tạo Topic, Lesson, Vocabulary và Question/QuestionOption.
     */
    private void seedGrade6Curriculum() {
        // ── School ──
        School school = schoolRepository.save(School.builder()
                .name("Trường THCS Nguyễn Du")
                .address("123 Nguyễn Du, Quận 1, TP.HCM")
                .phone("028 1234 5678")
                .email("contact@nguyendu.edu.vn")
                .isActive(true)
                .build());

        // ── Roles (already seeded in seedCoreRoles) ──
        Role roleTeacher = roleRepository.findByName(Role.TEACHER).orElse(null);

        // ── Dummy teacher (needed for ClassRoom & Exam relationships; no real user) ──
        User dummyTeacher = userRepository.save(User.builder()
                .username("teacher_seed")
                .email("teacher_seed@nguyendu.edu.vn")
                .passwordHash(passwordEncoder.encode("TeacherSeed@123"))
                .fullName("Giáo viên mẫu")
                .roles(roleTeacher != null ? Set.of(roleTeacher) : Set.of())
                .school(school)
                .isActive(true)
                .coins(0)
                .streakDays(0)
                .build());

        // ── ClassRooms ──
        ClassRoom class6A = classRoomRepository.save(ClassRoom.builder()
                .name("Lớp 6A1").school(school).teacher(dummyTeacher)
                .academicYear("2025-2026").isActive(true).build());

        classRoomRepository.save(ClassRoom.builder()
                .name("Lớp 6A2").school(school).teacher(dummyTeacher)
                .academicYear("2025-2026").isActive(true).build());

        // Học kỳ I
        Topic topicHK1 = topicRepository.save(Topic.builder()
                .name("Tiếng Anh Lớp 6 - Học Kỳ I")
                .description("Chương trình Tiếng Anh lớp 6 theo SGK mới, học kỳ I gồm 6 đơn vị bài học với các chủ đề: trường học, nhà cửa, bạn bè, khu phố, kỳ quan thiên nhiên, và Tết Nguyên Đán.")
                .build());

        // LESSON 1: My New School
        Lesson lesson1 = lessonRepository.save(Lesson.builder()
                .title("Unit 1: My New School")
                .topic(topicHK1)
                .contentHtml("<h2>My New School - Ngôi trường mới của tôi</h2>"
                        + "<p>Trong bài học này, các em sẽ học từ vựng về trường học, các vật dụng học tập "
                        + "và cách giới thiệu về ngôi trường của mình bằng tiếng Anh.</p>"
                        + "<h3>Grammar Focus</h3>"
                        + "<ul><li>Present Simple Tense</li><li>Prepositions of place</li></ul>")
                .grammarHtml(grammarHtmlForUnit(1))
                .difficultyLevel(1)
                .orderIndex(1)
                .isPublished(true)
                .build());

        saveVocab(lesson1, "boarding school", "/ˈbɔːdɪŋ skuːl/", "trường nội trú (n)",
                "She studies at a boarding school in Da Lat.",
                "https://cdn.giaoducthoidai.vn/images/a49a3d81689ab6663223caa8499ba5facd95add9a10bc164a67f30dbc85068b1c8323a2766d930bc5f2ff006b195cb05/nhatruong-7651.jpg",
                "https://dict.youdao.com/dictvoice?audio=boarding+school&type=1");
        saveVocab(lesson1, "principal", "/ˈprɪn.sɪ.pəl/", "hiệu trưởng (n)",
                "The principal gave a speech at the ceremony.",
                "https://cdn.giaoduc.net.vn/images/5eab9354771a9176f6565f8e7c44b8093cfeae2054375c57c5964e1fe14c7b943dc1ebaac51b55b5900593a42bd79de18e0994015ed0e5565eb2131129ed04d3/anh-minh-hoa-hieu-truong.jpg",
                "https://dict.youdao.com/dictvoice?audio=principal&type=1");
        saveVocab(lesson1, "teacher", "/ˈtiːtʃə(r)/", "giáo viên (n)",
                "My English teacher is very kind.",
                "https://cafefcdn.com/203337114487263232/2025/7/7/co-giao-thai-vy-1694360246448-1-1751929824911-17519298256511390765632.jpg",
                "https://dict.youdao.com/dictvoice?audio=teacher&type=1");
        saveVocab(lesson1, "classmate", "/ˈklɑːsmeɪt/", "bạn cùng lớp (n)",
                "I have 40 classmates in my class.",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQv_y9_zYlYrsb61xvtabKBfl_2jr54w9uExQ&s",
                "https://dict.youdao.com/dictvoice?audio=classmate&type=1");
        saveVocab(lesson1, "student", "/ˈstjuːdənt/", "học sinh (n)",
                "There are 500 students in my school.",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRB5Ekxcz7owbH7gNdPoym7eI3dBjsn8gF0TQ&s",
                "https://dict.youdao.com/dictvoice?audio=student&type=1");
        saveVocab(lesson1, "school supply", "/ˈskuːl səˈplaɪ/", "dụng cụ học tập (n)",
                "I need to buy some school supplies.",
                "https://vietq.vn/Images/lelan/2023/08/25/dung-cu-hoc-tap.jpg",
                "https://dict.youdao.com/dictvoice?audio=school+supply&type=1");
        saveVocab(lesson1, "pencil sharpener", "/ˈpensl ˈʃɑːpənər/", "gọt bút chì (n)",
                "Can I borrow your pencil sharpener?",
                "https://vanphongphamhl.vn/images/products/2024/03/22/large/got-but-chi-staedtler-1_1711103517.jpg",
                "https://dict.youdao.com/dictvoice?audio=pencil+sharpener&type=1");
        saveVocab(lesson1, "rubber", "/ˈrʌb.ər/", "cục tẩy (n)",
                "I made a mistake, give me a rubber please.",
                "https://sonca.vn/wp-content/uploads/2019/07/gom-plus-nho-1200x1200.jpg",
                "https://dict.youdao.com/dictvoice?audio=rubber&type=1");
        saveVocab(lesson1, "calculator", "/ˈkælkjuleɪtə(r)/", "máy tính (n)",
                "We use a calculator in Math class.",
                "https://cdn.tgdd.vn/hoi-dap/1389155/video-cach-viet-chu-tren-may-tinh-cam-tay-may-tinh-bo-tui12-800x600.jpg",
                "https://dict.youdao.com/dictvoice?audio=calculator&type=1");
        saveVocab(lesson1, "compass", "/ˈkʌmpəs/", "com-pa (n)",
                "I need a compass to draw a circle.",
                "https://media.dolenglish.vn/PUBLIC/MEDIA/9831903c-8e80-4c5d-b106-b62c9066cb2a.jpg",
                "https://dict.youdao.com/dictvoice?audio=compass&type=1");
        saveVocab(lesson1, "uniform", "/ˈjuːnɪfɔːm/", "đồng phục (n)",
                "Students wear uniform every day.",
                "https://dongphucsaigon.vn/wp-content/uploads/2025/08/bo-do-dong-phuc-cong-so-dep-tien-loi-2.jpg",
                "https://dict.youdao.com/dictvoice?audio=uniform&type=1");

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

        // LESSON 2: My House
        Lesson lesson2 = lessonRepository.save(Lesson.builder()
                .title("Unit 2: My House")
                .topic(topicHK1)
                .contentHtml("<h2>My House - Ngôi nhà của tôi</h2>"
                        + "<p>Bài học này giúp các em mô tả ngôi nhà, các phòng và đồ vật trong nhà bằng tiếng Anh.</p>"
                        + "<h3>Grammar Focus</h3>"
                        + "<ul><li>There is / There are</li><li>Prepositions of place: in, on, under, behind</li></ul>")
                .grammarHtml(grammarHtmlForUnit(2))
                .difficultyLevel(1)
                .orderIndex(2)
                .isPublished(true)
                .build());

        saveVocab(lesson2, "country house", "/ˌkʌn.tri ˈhaʊs/", "nhà ở nông thôn (n)",
                "My grandparents live in a country house.",
                "https://kientructb.com/wp-content/uploads/2022/06/nha-o-nong-thon-1.jpg",
                "https://dict.youdao.com/dictvoice?audio=country+house&type=1");
        saveVocab(lesson2, "stilt house", "/stɪltsˌhaʊs/", "nhà sàn (n)",
                "Stilt houses are common in the mountains.",
                "https://vinhtuong.com/sites/default/files/inline-images/nha-san-24.png",
                "https://dict.youdao.com/dictvoice?audio=stilt+house&type=1");
        saveVocab(lesson2, "villa", "/ˈvɪl.ə/", "biệt thự (n)",
                "They live in a beautiful villa by the beach.",
                "https://nhadepshouse.com/hinh-anh/cate/trg-17654450153668.webp",
                "https://dict.youdao.com/dictvoice?audio=villa&type=1");
        saveVocab(lesson2, "attic", "/ˈæt.ɪk/", "gác mái (n)",
                "We keep old things in the attic.",
                "https://noithatthongminh.pro/wp-content/uploads/2019/12/low-ceiling-attic-bedroom-design-1.jpg",
                "https://dict.youdao.com/dictvoice?audio=attic&type=1");
        saveVocab(lesson2, "air conditioner", "/ˈeər kənˌdɪʃ.ə.nər/", "máy điều hòa (n)",
                "Please turn on the air conditioner, it's hot.",
                "https://kooda.vn/wp-content/uploads/2025/12/may-lanh-1-chieu.jpg.jpg",
                "https://dict.youdao.com/dictvoice?audio=air+conditioner&type=1");
        saveVocab(lesson2, "chest of drawers", "/ˌtʃest əv ˈdrɔːrz/", "ngăn kéo tủ (n)",
                "Put your clothes in the chest of drawers.",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPj3lp-SVv1erWXI3uSrOrEK3Tb6MhCjqCuA&s",
                "https://dict.youdao.com/dictvoice?audio=chest+of+drawers&type=1");
        saveVocab(lesson2, "dishwasher", "/ˈdɪʃˌwɒʃ.ər/", "máy rửa bát (n)",
                "The dishwasher makes housework easier.",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXOFCtf3aPz7hYs_qBhTVVRD454UrXwZgdew&s",
                "https://dict.youdao.com/dictvoice?audio=dishwasher&type=1");
        saveVocab(lesson2, "microwave", "/ˈmaɪ.kroʊ.weɪv/", "lò vi sóng (n)",
                "I heated my food in the microwave.",
                "https://hsn.vn/images/stories/virtuemart/product/lo-vi-song-bauer-bmo25h93sl-2.jpg",
                "https://dict.youdao.com/dictvoice?audio=microwave&type=1");
        saveVocab(lesson2, "wardrobe", "/ˈwɔːrdroʊb/", "tủ quần áo (n)",
                "My wardrobe is full of clothes.",
                "https://bizweb.dktcdn.net/100/429/325/products/o1cn012shzpl1psjdbflbf7-2214670281839-0-cib.jpg?v=1696941369057",
                "https://dict.youdao.com/dictvoice?audio=wardrobe&type=1");

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

        // LESSON 3: My Friends
        Lesson lesson3 = lessonRepository.save(Lesson.builder()
                .title("Unit 3: My Friends")
                .topic(topicHK1)
                .contentHtml("<h2>My Friends - Những người bạn của tôi</h2>"
                        + "<p>Học cách mô tả ngoại hình và tính cách bạn bè bằng tiếng Anh.</p>"
                        + "<h3>Grammar Focus</h3>"
                        + "<ul><li>Present Continuous Tense</li><li>Adjectives for appearance and personality</li></ul>")
                .grammarHtml(grammarHtmlForUnit(3))
                .difficultyLevel(1)
                .orderIndex(3)
                .isPublished(true)
                .build());

        saveVocab(lesson3, "appearance", "/əˈpɪər.əns/", "ngoại hình (n)",
                "Don't judge people by their appearance.",
                "https://tq2.mediacdn.vn/150157425591193600/2021/1/23/photo-2-1611380059164813372855-1611380696472-16113806966834985263.jpg",
                "https://dict.youdao.com/dictvoice?audio=appearance&type=1");
        saveVocab(lesson3, "chubby", "/ˈtʃʌb.i/", "phúng phính (adj)",
                "The baby has chubby cheeks.",
                "https://i.pinimg.com/236x/cf/4b/2f/cf4b2f7fb8389fb110b41a6599534314.jpg",
                "https://dict.youdao.com/dictvoice?audio=chubby&type=1");
        saveVocab(lesson3, "creative", "/kriˈeɪ.tɪv/", "sáng tạo (adj)",
                "She is very creative in art class.",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpgmP_8jEn00ykuwV1Ykqrg5J1Ev0jLw9hEw&s",
                "https://dict.youdao.com/dictvoice?audio=creative&type=1");
        saveVocab(lesson3, "generous", "/ˈdʒen.ə.rəs/", "hào phóng (adj)",
                "My friend is generous, she always shares.",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8PFPCHHa3sacujvP-MiksaT5aZQX_zSFLvA&s",
                "https://dict.youdao.com/dictvoice?audio=generous&type=1");
        saveVocab(lesson3, "patient", "/ˈpeɪ.ʃənt/", "kiên nhẫn (adj)",
                "A good teacher must be patient.",
                "https://png.pngtree.com/png-clipart/20210115/ourmid/pngtree-detective-patiently-looking-for-clues-clipart-png-image_2741530.jpg",
                "https://dict.youdao.com/dictvoice?audio=patient&type=1");
        saveVocab(lesson3, "talkative", "/ˈtɔː.kə.tɪv/", "hay nói (adj)",
                "My sister is very talkative.",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfTPx9aTzxKy9J6O8rbckePOuygar2YWUuAw&s",
                "https://dict.youdao.com/dictvoice?audio=talkative&type=1");
        saveVocab(lesson3, "hard-working", "/ˌhɑːrdˈwɜː.kɪŋ/", "chăm chỉ (adj)",
                "He is a hard-working student.",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVq6BFoa2kwms5IOljWaMxDJpcQ3fNjxS7jA&s",
                "https://dict.youdao.com/dictvoice?audio=hard-working&type=1");
        saveVocab(lesson3, "ponytail", "/ˈpoʊ.ni.teɪl/", "tóc đuôi ngựa (n)",
                "She always wears her hair in a ponytail.",
                "https://i.pinimg.com/564x/85/f9/93/85f993f920ff5e54fa3ffaae16053534.jpg",
                "https://dict.youdao.com/dictvoice?audio=ponytail&type=1");

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

        // LESSON 4: My Neighborhood
        Lesson lesson4 = lessonRepository.save(Lesson.builder()
                .title("Unit 4: My Neighborhood")
                .topic(topicHK1)
                .contentHtml("<h2>My Neighborhood - Khu phố của tôi</h2>"
                        + "<p>Học cách mô tả các địa điểm và đặc điểm khu phố nơi em sống.</p>"
                        + "<h3>Grammar Focus</h3>"
                        + "<ul><li>Comparative adjectives</li><li>Superlative adjectives</li></ul>")
                .grammarHtml(grammarHtmlForUnit(4))
                .difficultyLevel(2)
                .orderIndex(4)
                .isPublished(true)
                .build());

        saveVocab(lesson4, "cathedral", "/kəˈθiːdrəl/", "nhà thờ lớn (n)",
                "The cathedral is in the city center.",
                "https://ik.imagekit.io/tvlk/blog/2022/08/nha-tho-lon-ha-noi-3-819x1024.jpg?tr=q-70,c-at_max,w-1000,h-600",
                "https://dict.youdao.com/dictvoice?audio=cathedral&type=1");
        saveVocab(lesson4, "convenient", "/kənˈviːniənt/", "thuận tiện (adj)",
                "Living here is very convenient.",
                "https://webrt.vn/wp-content/uploads/2024/08/Thuan-loi-cua-doanh-nghiep-nho-1.jpg",
                "https://dict.youdao.com/dictvoice?audio=convenient&type=1");
        saveVocab(lesson4, "historic", "/hɪˈstɒrɪk/", "cổ kính (adj)",
                "Hoi An is a historic town.",
                "https://mia.vn/media/uploads/blog-du-lich/chiem-nguong-ve-dep-ha-noi-co-kinh-trong-nhung-ngay-thu-gio-nhe-1-1662430380.jpg",
                "https://dict.youdao.com/dictvoice?audio=historic&type=1");
        saveVocab(lesson4, "polluted", "/pəˈluːtɪd/", "ô nhiễm (adj)",
                "The river is polluted with waste.",
                "https://daknong.1cdn.vn/2025/09/09/dji_fly_20230221_111036_230_1676952644584_photo_optimized.jpg",
                "https://dict.youdao.com/dictvoice?audio=polluted&type=1");
        saveVocab(lesson4, "railway station", "/ˈreɪl.weɪ ˌsteɪ.ʃən/", "nhà ga xe lửa (n)",
                "The railway station is near my house.",
                "https://vending-cdn.kootoro.com/torov-cms/upload/image/1741166407497-nha-ga-sai-gon-1.jpg",
                "https://dict.youdao.com/dictvoice?audio=railway+station&type=1");
        saveVocab(lesson4, "art gallery", "/ˈɑːt ˌɡæl.ər.i/", "triển lãm nghệ thuật (n)",
                "We visited the art gallery last Sunday.",
                "https://artnam.vn/wp-content/uploads/2025/08/trien-lam-tranh-1600px.webp",
                "https://dict.youdao.com/dictvoice?audio=art+gallery&type=1");
        saveVocab(lesson4, "memorial", "/məˈmɔː.ri.əl/", "đài tưởng niệm (n)",
                "There is a war memorial in the park.",
                "https://daknong.1cdn.vn/2025/01/22/tuong-dai.jpg",
                "https://dict.youdao.com/dictvoice?audio=memorial&type=1");

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

        // LESSON 5: Natural Wonders of the World
        Lesson lesson5 = lessonRepository.save(Lesson.builder()
                .title("Unit 5: Natural Wonders of the World")
                .topic(topicHK1)
                .contentHtml("<h2>Natural Wonders of the World - Kỳ quan thiên nhiên thế giới</h2>"
                        + "<p>Khám phá các kỳ quan thiên nhiên và học từ vựng về du lịch, thiên nhiên.</p>"
                        + "<h3>Grammar Focus</h3>"
                        + "<ul><li>Must / Mustn't</li><li>Countable and Uncountable nouns</li></ul>")
                .grammarHtml(grammarHtmlForUnit(5))
                .difficultyLevel(2)
                .orderIndex(5)
                .isPublished(true)
                .build());

        saveVocab(lesson5, "desert", "/ˈdez.ət/", "sa mạc (n)",
                "The Sahara is the largest desert in the world.",
                "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sahara.jpg",
                "https://dict.youdao.com/dictvoice?audio=desert&type=1");
        saveVocab(lesson5, "waterfall", "/ˈwɔː.tər.fɔːl/", "thác nước (n)",
                "Ban Gioc is a famous waterfall in Vietnam.",
                "https://media.vietnamplus.vn/images/ed1918d4cf848798286fdbd286ae25b42701c75571900bc2c652f2b1bd7190e7985bf24f494d5ed9e3f34d6047a613e3a74f6b1bfe70b3203772c7979020cefa/ttxvn-thac-ban-gioc2.jpg",
                "https://dict.youdao.com/dictvoice?audio=waterfall&type=1");
        saveVocab(lesson5, "rainforest", "/ˈreɪn.fɒr.ɪst/", "rừng nhiệt đới (n)",
                "The Amazon rainforest is very large.",
                "https://ktmt.vnmediacdn.com/images/2021/10/06/45-1633506738-rung-nhiet-doi.jpg",
                "https://dict.youdao.com/dictvoice?audio=rainforest&type=1");
        saveVocab(lesson5, "hiking", "/ˈhaɪ.kɪŋ/", "đi bộ đường dài (n/v)",
                "We went hiking in the mountains last weekend.",
                "https://yuzi.vn/uploads/images/2023/02/800x600-1676604352-single_news6-1kinhnghiemhikingchonguoimoibatdau.jpg",
                "https://dict.youdao.com/dictvoice?audio=hiking&type=1");
        saveVocab(lesson5, "suncream", "/ˈsʌn.kriːm/", "kem chống nắng (n)",
                "Don't forget to bring suncream to the beach.",
                "https://product.hstatic.net/200000530637/product/kem-chong-nang-numbuzin-porcelain-base-skip-tone-up-beige-50ml_f948da9eb9f24dfba7b8408166066902_large.jpg",
                "https://dict.youdao.com/dictvoice?audio=suncream&type=1");
        saveVocab(lesson5, "sleeping bag", "/ˈsliː.pɪŋ ˌbæɡ/", "túi ngủ (n)",
                "You need a sleeping bag for camping.",
                "https://bizweb.dktcdn.net/100/479/165/products/5tui-ngu-naturehike-sieu-nhe-co-mu-trum-dau-nh15s009-d-4-1684378935843.jpg?v=1684378942347",
                "https://dict.youdao.com/dictvoice?audio=sleeping+bag&type=1");
        saveVocab(lesson5, "plaster", "/ˈplæs.tər/", "băng dán vết thương (n)",
                "Put a plaster on the cut.",
                "https://vimedtec.vn/wp-content/uploads/2020/12/Gac-bang-vet-thuong-chong-tham-nuoc-.png",
                "https://dict.youdao.com/dictvoice?audio=plaster&type=1");

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

        // LESSON 6: Our Tet Holiday
        Lesson lesson6 = lessonRepository.save(Lesson.builder()
                .title("Unit 6: Our Tet Holiday")
                .topic(topicHK1)
                .contentHtml("<h2>Our Tet Holiday - Kỳ nghỉ Tết của chúng tôi</h2>"
                        + "<p>Tìm hiểu từ vựng liên quan đến Tết Nguyên Đán - ngày lễ truyền thống quan trọng nhất của Việt Nam.</p>"
                        + "<h3>Grammar Focus</h3>"
                        + "<ul><li>Should / Shouldn't</li><li>Will for predictions</li></ul>")
                .grammarHtml(grammarHtmlForUnit(6))
                .difficultyLevel(2)
                .orderIndex(6)
                .isPublished(true)
                .build());

        saveVocab(lesson6, "family gathering", "/ˈfæməli ˈɡæðərɪŋ/", "sum họp gia đình (n)",
                "Tet is a time for family gatherings.",
                "https://mtcs.1cdn.vn/2025/01/23/bua-com.jpg",
                "https://dict.youdao.com/dictvoice?audio=family+gathering&type=1");
        saveVocab(lesson6, "peach blossom", "/piːtʃ ˈblɒs.əm/", "hoa đào (n)",
                "People in the North buy peach blossoms for Tet.",
                "https://assets.flowerstore.ph/public/tenantVN/app/assets/images/blog/1000_cW3SV0rtQxUBtcyui3HKRWR6b.jpg",
                "https://dict.youdao.com/dictvoice?audio=peach+blossom&type=1");
        saveVocab(lesson6, "apricot blossom", "/ˈeɪ.prɪ.kɒt ˈblɒs.əm/", "hoa mai (n)",
                "Apricot blossoms are popular in Southern Vietnam.",
                "https://cdn.xanhsm.com/2025/01/6bc22125-hoa-mai-1.jpg",
                "https://dict.youdao.com/dictvoice?audio=apricot+blossom&type=1");
        saveVocab(lesson6, "lucky money", "/ˈlʌk.i ˈmʌn.i/", "tiền lì xì (n)",
                "Children receive lucky money during Tet.",
                "https://cafefcdn.com/203337114487263232/2025/1/3/471398504-992980549539129-4141584510028559335-n-7947-8854-1735876021222-1735876021270212229128.jpg",
                "https://dict.youdao.com/dictvoice?audio=lucky+money&type=1");
        saveVocab(lesson6, "New Year's Eve", "/ˌnjuː jɪəz ˈiːv/", "giao thừa (n)",
                "We stay up late on New Year's Eve.",
                "https://cdn.tuoitrethudo.vn/stores/news_dataimages/tuoitrethudocomvn/012017/17/06/giao-thua-la-gi-55-.9051.jpg",
                "https://dict.youdao.com/dictvoice?audio=New+Year's+Eve&type=1");
        saveVocab(lesson6, "fireworks", "/ˈfaɪə.wɜːks/", "pháo hoa (n)",
                "There are beautiful fireworks on New Year's Eve.",
                "https://cdnphoto.dantri.com.vn/iYEVIvLcVNE66du9TdSYjPJ8nis=/thumb_w/1020/2025/12/31/3jpg-1767170279028.jpg",
                "https://dict.youdao.com/dictvoice?audio=fireworks&type=1");
        saveVocab(lesson6, "first footing", "/ˈfɜːst ˈfʊt.ɪŋ/", "xông đất (n)",
                "First footing is a Tet tradition in Vietnam.",
                "https://mtcs.1cdn.vn/2023/01/18/xong-dat.jpg",
                "https://dict.youdao.com/dictvoice?audio=first+footing&type=1");

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

        // Học kỳ II (gọi lại logic từ DevDataSeeder, nhưng không gắn teacher/class/exam)
        List<Lesson> hk2Lessons = seedSemester2(topicHK1, dummyTeacher, class6A);
        Lesson lesson7 = hk2Lessons.get(0);
        Lesson lesson8 = hk2Lessons.get(1);
        Lesson lesson9 = hk2Lessons.get(2);
        Lesson lesson10 = hk2Lessons.get(3);
        Lesson lesson11 = hk2Lessons.get(4);
        Lesson lesson12 = hk2Lessons.get(5);

        // ── EXAMS ──
        LocalDateTime now = LocalDateTime.now();

        // Exam 1: Unit 1-2
        List<Question> exam1Questions = questionRepository.findByLessonId(lesson1.getId());
        exam1Questions.addAll(questionRepository.findByLessonId(lesson2.getId()));
        examRepository.save(Exam.builder()
                .title("Kiểm tra 15 phút - Unit 1 & 2: School & House")
                .teacher(dummyTeacher).classRoom(class6A)
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
                .teacher(dummyTeacher).classRoom(class6A)
                .startTime(now.minusDays(1)).endTime(now.plusDays(14))
                .durationMinutes(15)
                .shuffleQuestions(true).shuffleAnswers(true).antiCheatEnabled(true)
                .status("PUBLISHED")
                .questions(new HashSet<>(exam2Questions))
                .build());

        // Exam 3: Mid-term I (all units HK1)
        List<Question> midtermQuestions = questionRepository.findByLessonId(lesson1.getId());
        midtermQuestions.addAll(questionRepository.findByLessonId(lesson2.getId()));
        midtermQuestions.addAll(questionRepository.findByLessonId(lesson3.getId()));
        midtermQuestions.addAll(questionRepository.findByLessonId(lesson4.getId()));
        midtermQuestions.addAll(questionRepository.findByLessonId(lesson5.getId()));
        midtermQuestions.addAll(questionRepository.findByLessonId(lesson6.getId()));
        examRepository.save(Exam.builder()
                .title("Kiểm tra Giữa Kỳ I - Tiếng Anh 6")
                .teacher(dummyTeacher).classRoom(class6A)
                .startTime(now.minusDays(1)).endTime(now.plusDays(30))
                .durationMinutes(45)
                .shuffleQuestions(true).shuffleAnswers(true).antiCheatEnabled(true)
                .status("PUBLISHED")
                .questions(new HashSet<>(midtermQuestions))
                .build());

        // Exam 4: Unit 7-8 (15 min)
        List<Question> exam4Questions = questionRepository.findByLessonId(lesson7.getId());
        exam4Questions.addAll(questionRepository.findByLessonId(lesson8.getId()));
        examRepository.save(Exam.builder()
                .title("Kiểm tra 15 phút - Unit 7 & 8: Television & Sports")
                .teacher(dummyTeacher).classRoom(class6A)
                .startTime(now.minusDays(1)).endTime(now.plusDays(48))
                .durationMinutes(15)
                .shuffleQuestions(true).shuffleAnswers(true).antiCheatEnabled(true)
                .status("PUBLISHED")
                .questions(new HashSet<>(exam4Questions))
                .build());

        // Exam 5: Unit 9-10 (15 min)
        List<Question> exam5Questions = questionRepository.findByLessonId(lesson9.getId());
        exam5Questions.addAll(questionRepository.findByLessonId(lesson10.getId()));
        examRepository.save(Exam.builder()
                .title("Kiểm tra 15 phút - Unit 9 & 10: Cities & Future Houses")
                .teacher(dummyTeacher).classRoom(class6A)
                .startTime(now.minusDays(1)).endTime(now.plusDays(63))
                .durationMinutes(15)
                .shuffleQuestions(true).shuffleAnswers(true).antiCheatEnabled(true)
                .status("PUBLISHED")
                .questions(new HashSet<>(exam5Questions))
                .build());

        // Exam 6: Unit 11-12 (15 min)
        List<Question> exam6Questions = questionRepository.findByLessonId(lesson11.getId());
        exam6Questions.addAll(questionRepository.findByLessonId(lesson12.getId()));
        examRepository.save(Exam.builder()
                .title("Kiểm tra 15 phút - Unit 11 & 12: Green World & Robots")
                .teacher(dummyTeacher).classRoom(class6A)
                .startTime(now.minusDays(1)).endTime(now.plusDays(78))
                .durationMinutes(15)
                .shuffleQuestions(true).shuffleAnswers(true).antiCheatEnabled(true)
                .status("PUBLISHED")
                .questions(new HashSet<>(exam6Questions))
                .build());

        // Exam 7: Mid-term II (Units 7-12)
        List<Question> midterm2Questions = questionRepository.findByLessonId(lesson7.getId());
        midterm2Questions.addAll(questionRepository.findByLessonId(lesson8.getId()));
        midterm2Questions.addAll(questionRepository.findByLessonId(lesson9.getId()));
        midterm2Questions.addAll(questionRepository.findByLessonId(lesson10.getId()));
        examRepository.save(Exam.builder()
                .title("Kiểm tra Giữa Kỳ II - Tiếng Anh 6")
                .teacher(dummyTeacher).classRoom(class6A)
                .startTime(now.minusDays(1)).endTime(now.plusDays(93))
                .durationMinutes(45)
                .shuffleQuestions(true).shuffleAnswers(true).antiCheatEnabled(true)
                .status("PUBLISHED")
                .questions(new HashSet<>(midterm2Questions))
                .build());

        // Exam 8: Final II (Units 7-12)
        List<Question> finalQuestions = questionRepository.findByLessonId(lesson7.getId());
        finalQuestions.addAll(questionRepository.findByLessonId(lesson8.getId()));
        finalQuestions.addAll(questionRepository.findByLessonId(lesson9.getId()));
        finalQuestions.addAll(questionRepository.findByLessonId(lesson10.getId()));
        finalQuestions.addAll(questionRepository.findByLessonId(lesson11.getId()));
        finalQuestions.addAll(questionRepository.findByLessonId(lesson12.getId()));
        examRepository.save(Exam.builder()
                .title("Kiểm tra Cuối Kỳ II - Tiếng Anh 6")
                .teacher(dummyTeacher).classRoom(class6A)
                .startTime(now.minusDays(1)).endTime(now.plusDays(108))
                .durationMinutes(60)
                .shuffleQuestions(true).shuffleAnswers(true).antiCheatEnabled(true)
                .status("PUBLISHED")
                .questions(new HashSet<>(finalQuestions))
                .build());

        log.info("Seeded Grade 6 curriculum on production: lessons={}, topicHK1={}, hk2Lessons={}.",
                6 + hk2Lessons.size(), topicHK1.getId(),
                List.of(lesson7.getId(), lesson8.getId(), lesson9.getId(), lesson10.getId(), lesson11.getId(), lesson12.getId()));
    }

    private List<Lesson> seedSemester2(Topic topicHK1, User teacher, ClassRoom class6A) {
        // Tạo Topic học kỳ II riêng
        Topic topicHK2 = topicRepository.save(Topic.builder()
                .name("Tiếng Anh Lớp 6 - Học Kỳ II")
                .description("Chương trình Tiếng Anh lớp 6 theo SGK Global Success, học kỳ II gồm 6 đơn vị bài học với các chủ đề: truyền hình, thể thao, thành phố thế giới, ngôi nhà tương lai, thế giới xanh, và robot.")
                .build());

        // LESSON 7: Television
        Lesson lesson7 = lessonRepository.save(Lesson.builder()
                .title("Unit 7: Television").topic(topicHK2)
                .contentHtml("<h2>Television - Truyền hình</h2><p>Trong bài học này, các em sẽ học từ vựng về các chương trình truyền hình, cách diễn tả sở thích xem TV và sử dụng liên từ.</p><h3>Grammar Focus</h3><ul><li>Conjunctions: and, but, so, because, although</li><li>Wh-questions review</li></ul>")
                .difficultyLevel(2).orderIndex(7).isPublished(true).build());
        saveVocab(lesson7, "cartoon", "/kɑːˈtuːn/", "phim hoạt hình (n)", "My favourite cartoon is Doraemon.", "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=cartoon&type=1");
        saveVocab(lesson7, "comedy", "/ˈkɒm.ə.di/", "phim hài (n)", "I like watching comedy shows.", "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=comedy&type=1");
        saveVocab(lesson7, "game show", "/ˈɡeɪm ʃəʊ/", "chương trình trò chơi (n)", "There is an interesting game show on TV tonight.", "https://bcp.cdnchinhphu.vn/334894974524682240/2025/1/8/quy-hiem-1736326183941422579539.jpg", "https://dict.youdao.com/dictvoice?audio=game+show&type=1");
        saveVocab(lesson7, "news", "/njuːz/", "tin tức (n)", "The news is on channel 1 every evening.", "https://static.vnncdn.net/v1//tin-tuc-online/backgrounds/ttol-thumb.jpg", "https://dict.youdao.com/dictvoice?audio=news&type=1");
        saveVocab(lesson7, "animal programme", "/ˈæn.ɪ.məl ˈprəʊ.ɡræm/", "chương trình về động vật (n)", "I enjoy watching animal programmes.", "https://bcp.cdnchinhphu.vn/334894974524682240/2025/1/8/quy-hiem-1736326183941422579539.jpg", "https://dict.youdao.com/dictvoice?audio=animal+programme&type=1");
        saveVocab(lesson7, "educational", "/ˌed.juˈkeɪ.ʃən.əl/", "mang tính giáo dục (adj)", "This educational programme teaches us about science.", "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=educational&type=1");
        saveVocab(lesson7, "channel", "/ˈtʃæn.əl/", "kênh truyền hình (n)", "What channel is the film on?", "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=channel&type=1");
        saveVocab(lesson7, "audience", "/ˈɔː.di.əns/", "khán giả (n)", "The audience clapped and cheered.", "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=audience&type=1");
        saveVocab(lesson7, "character", "/ˈkær.ək.tər/", "nhân vật (n)", "She is the main character in the film.", "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=character&type=1");
        saveVocab(lesson7, "broadcast", "/ˈbrɔːd.kɑːst/", "phát sóng (v)", "They broadcast the football match live.", "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=broadcast&type=1");
        saveVocab(lesson7, "viewer", "/ˈvjuː.ər/", "người xem TV (n)", "VTV is a popular TV channel.", "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=viewer&type=1");
        saveVocab(lesson7, "talent show", "/ˈtæl.ənt ʃəʊ/", "cuộc thi tài năng (n)", "The talent show attracted many young singers.", "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=talent+show&type=1");
        saveVocab(lesson7, "action film", "/ˈæk.ʃən fɪlm/", "phim hành động (n)", "I love watching action films.", "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=action+film&type=1");

        Question q7_1 = saveQuestion(lesson7, "MULTIPLE_CHOICE", "A programme that teaches you something is called an ___ programme.");
        saveOption(q7_1, "action", false);
        saveOption(q7_1, "educational", true);
        saveOption(q7_1, "comedy", false);
        saveOption(q7_1, "cartoon", false);
        Question q7_2 = saveQuestion(lesson7, "TRUE_FALSE", "A 'cartoon' is a programme with animated characters.");
        saveOption(q7_2, "True", true);
        saveOption(q7_2, "False", false);
        Question q7_3 = saveQuestion(lesson7, "MULTIPLE_CHOICE", "'Khán giả' in English is ___.");
        saveOption(q7_3, "viewer", false);
        saveOption(q7_3, "audience", true);
        saveOption(q7_3, "character", false);
        saveOption(q7_3, "channel", false);
        Question q7_4 = saveQuestion(lesson7, "MULTIPLE_CHOICE", "Which word means 'phát sóng' in English?");
        saveOption(q7_4, "channel", false);
        saveOption(q7_4, "programme", false);
        saveOption(q7_4, "broadcast", true);
        saveOption(q7_4, "compete", false);

        // LESSON 8: Sports and Games
        Lesson lesson8 = lessonRepository.save(Lesson.builder()
                .title("Unit 8: Sports and Games").topic(topicHK2)
                .contentHtml("<h2>Sports and Games - Thể thao và trò chơi</h2><p>Bài học giúp các em học từ vựng về các môn thể thao, trò chơi và cách sử dụng thì quá khứ đơn.</p><h3>Grammar Focus</h3><ul><li>Past Simple Tense</li><li>Imperatives</li></ul>")
                .difficultyLevel(2).orderIndex(8).isPublished(true).build());
        saveVocab(lesson8, "karate", "/kəˈrɑː.ti/", "môn karate (n)", "Karate is a popular martial art.", "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=karate&type=1");
        saveVocab(lesson8, "table tennis", "/ˈteɪ.bəl ˈten.ɪs/", "bóng bàn (n)", "I play table tennis every weekend.", "https://thethaothienlong.vn/wp-content/uploads/2022/08/bong-ban-tieng-anh-thu-1.png", "https://dict.youdao.com/dictvoice?audio=table+tennis&type=1");
        saveVocab(lesson8, "swimming", "/ˈswɪm.ɪŋ/", "bơi lội (n)", "Swimming is good for your health.", "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=swimming&type=1");
        saveVocab(lesson8, "gym", "/dʒɪm/", "phòng tập thể dục (n)", "He goes to the gym every morning.", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=gym&type=1");
        saveVocab(lesson8, "club", "/klʌb/", "câu lạc bộ (n)", "I joined the school's sports club.", "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=club&type=1");
        saveVocab(lesson8, "racket", "/ˈræk.ɪt/", "vợt (n)", "You need a racket to play badminton.", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcxEnB16IGF197dKHUwmhpQYo8nBTxNStduA&s", "https://dict.youdao.com/dictvoice?audio=racket&type=1");
        saveVocab(lesson8, "cycling", "/ˈsaɪ.klɪŋ/", "đạp xe (n)", "Cycling is my favourite sport.", "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=cycling&type=1");
        saveVocab(lesson8, "match", "/mætʃ/", "trận đấu (n)", "Our team won the football match.", "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=match&type=1");
        saveVocab(lesson8, "fit", "/fɪt/", "cân đối, khỏe mạnh (adj)", "She does exercise to keep fit.", "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=fit&type=1");
        saveVocab(lesson8, "chess", "/tʃes/", "cờ vua (n)", "Chess is a board game that needs thinking.", "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=chess&type=1");
        saveVocab(lesson8, "equipment", "/ɪˈkwɪp.mənt/", "thiết bị (n)", "Our school has modern sports equipment.", "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=equipment&type=1");
        saveVocab(lesson8, "marathon", "/ˈmær.ə.θɒn/", "cuộc chạy marathon (n)", "The marathon is a long-distance running event.", "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=marathon&type=1");
        saveVocab(lesson8, "athlete", "/ˈæθ.liːt/", "vận động viên (n)", "He is a professional athlete.", "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=athlete&type=1");

        Question q8_1 = saveQuestion(lesson8, "MULTIPLE_CHOICE", "You need a ___ to play badminton.");
        saveOption(q8_1, "ball", false);
        saveOption(q8_1, "racket", true);
        saveOption(q8_1, "helmet", false);
        saveOption(q8_1, "net", false);
        Question q8_2 = saveQuestion(lesson8, "TRUE_FALSE", "'Gym' means 'phòng tập thể dục' in Vietnamese.");
        saveOption(q8_2, "True", true);
        saveOption(q8_2, "False", false);
        Question q8_3 = saveQuestion(lesson8, "MULTIPLE_CHOICE", "A person who plays sports professionally is called an ___.");
        saveOption(q8_3, "player", false);
        saveOption(q8_3, "viewer", false);
        saveOption(q8_3, "athlete", true);
        saveOption(q8_3, "coach", false);
        Question q8_4 = saveQuestion(lesson8, "MULTIPLE_CHOICE", "Which of these is NOT a sport?");
        saveOption(q8_4, "cycling", false);
        saveOption(q8_4, "karate", false);
        saveOption(q8_4, "channel", true);
        saveOption(q8_4, "swimming", false);

        // LESSON 9: Cities of the World
        Lesson lesson9 = lessonRepository.save(Lesson.builder()
                .title("Unit 9: Cities of the World").topic(topicHK2)
                .contentHtml("<h2>Cities of the World - Các thành phố trên thế giới</h2><p>Khám phá các thành phố nổi tiếng trên thế giới, học cách mô tả địa điểm và thời tiết.</p><h3>Grammar Focus</h3><ul><li>Superlative adjectives (review)</li><li>Present Perfect Tense (introduction)</li></ul>")
                .difficultyLevel(3).orderIndex(9).isPublished(true).build());
        saveVocab(lesson9, "famous", "/ˈfeɪ.məs/", "nổi tiếng (adj)", "Paris is famous for the Eiffel Tower.", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=famous&type=1");
        saveVocab(lesson9, "landmark", "/ˈlænd.mɑːk/", "địa danh, công trình nổi tiếng (n)", "The Statue of Liberty is a famous landmark.", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgprJ_BMy2OL7e55zAx0mBrrVQ4HIvxnmOVQ&s", "https://dict.youdao.com/dictvoice?audio=landmark&type=1");
        saveVocab(lesson9, "crowded", "/ˈkraʊd.ɪd/", "đông đúc (adj)", "The city centre is always crowded.", "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=crowded&type=1");
        saveVocab(lesson9, "modern", "/ˈmɒd.ən/", "hiện đại (adj)", "Tokyo is a modern and exciting city.", "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=modern&type=1");
        saveVocab(lesson9, "rainy", "/ˈreɪ.ni/", "nhiều mưa (adj)", "The weather in London is often rainy.", "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=rainy&type=1");
        saveVocab(lesson9, "sunny", "/ˈsʌn.i/", "nhiều nắng (adj)", "It is very sunny in Ho Chi Minh City.", "https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=sunny&type=1");
        saveVocab(lesson9, "tasty", "/ˈteɪ.sti/", "ngon miệng (adj)", "The food in Thailand is very tasty.", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=tasty&type=1");
        saveVocab(lesson9, "wonderful", "/ˈwʌn.də.fəl/", "tuyệt vời (adj)", "Sydney has a wonderful harbour.", "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=wonderful&type=1");
        saveVocab(lesson9, "pagoda", "/pəˈɡəʊ.də/", "chùa (n)", "We visited an ancient pagoda in Hue.", "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=pagoda&type=1");
        saveVocab(lesson9, "holiday", "/ˈhɒl.ə.deɪ/", "kỳ nghỉ (n)", "She went on a holiday to Japan.", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=holiday&type=1");
        saveVocab(lesson9, "interesting", "/ˈɪn.trə.stɪŋ/", "thú vị (adj)", "New York is an interesting city to visit.", "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=interesting&type=1");
        saveVocab(lesson9, "helpful", "/ˈhelp.fəl/", "hữu ích, hay giúp đỡ (adj)", "People in that country are very helpful.", "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=helpful&type=1");
        saveVocab(lesson9, "town", "/taʊn/", "thị trấn (n)", "The town is small but beautiful.", "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=town&type=1");

        Question q9_1 = saveQuestion(lesson9, "TRUE_FALSE", "A 'landmark' is a famous building or place.");
        saveOption(q9_1, "True", true);
        saveOption(q9_1, "False", false);
        Question q9_2 = saveQuestion(lesson9, "MULTIPLE_CHOICE", "'Đông đúc' in English is ___.");
        saveOption(q9_2, "modern", false);
        saveOption(q9_2, "crowded", true);
        saveOption(q9_2, "famous", false);
        saveOption(q9_2, "wonderful", false);
        Question q9_3 = saveQuestion(lesson9, "MULTIPLE_CHOICE", "A place of worship in Asia is often called a ___.");
        saveOption(q9_3, "landmark", false);
        saveOption(q9_3, "pagoda", true);
        saveOption(q9_3, "town", false);
        saveOption(q9_3, "cathedral", false);
        Question q9_4 = saveQuestion(lesson9, "MULTIPLE_CHOICE", "Which word means 'ngon miệng'?");
        saveOption(q9_4, "rainy", false);
        saveOption(q9_4, "sunny", false);
        saveOption(q9_4, "tasty", true);
        saveOption(q9_4, "crowded", false);

        // LESSON 10: Our Houses in the Future
        Lesson lesson10 = lessonRepository.save(Lesson.builder()
                .title("Unit 10: Our Houses in the Future").topic(topicHK2)
                .contentHtml("<h2>Our Houses in the Future - Ngôi nhà trong tương lai</h2><p>Tưởng tượng và mô tả ngôi nhà trong tương lai với các thiết bị công nghệ hiện đại.</p><h3>Grammar Focus</h3><ul><li>Will for future predictions</li><li>Might for possibility</li></ul>")
                .difficultyLevel(3).orderIndex(10).isPublished(true).build());
        saveVocab(lesson10, "appliance", "/əˈplaɪ.əns/", "thiết bị, đồ gia dụng (n)", "A smart TV is a modern appliance.", "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=appliance&type=1");
        saveVocab(lesson10, "space station", "/speɪs ˈsteɪ.ʃən/", "trạm vũ trụ (n)", "We might live in a space station in the future.", "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=space+station&type=1");
        saveVocab(lesson10, "solar energy", "/ˈsəʊ.lər ˈen.ə.dʒi/", "năng lượng mặt trời (n)", "Solar energy is clean and renewable.", "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=solar+energy&type=1");
        saveVocab(lesson10, "housework", "/ˈhaʊs.wɜːk/", "công việc nhà (n)", "The robot will help us do housework.", "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=housework&type=1");
        saveVocab(lesson10, "hi-tech", "/ˌhaɪˈtek/", "công nghệ cao (adj)", "Future houses might be hi-tech.", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRorCQtlx-h3YJi6c3q6kYh4_p8rHiehBABpg&s", "https://dict.youdao.com/dictvoice?audio=hi-tech&type=1");
        saveVocab(lesson10, "wireless", "/ˈwaɪə.ləs/", "không dây (adj)", "We will use wireless devices in the future.", "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=wireless&type=1");
        saveVocab(lesson10, "UFO", "/ˌjuː.efˈəʊ/", "vật thể bay không xác định (n)", "A UFO is an unidentified flying object.", "https://images.unsplash.com/photo-1534239697798-120952b76f2b?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=UFO&type=1");
        saveVocab(lesson10, "electric cooker", "/ɪˈlek.trɪk ˈkʊk.ər/", "bếp điện (n)", "An electric cooker saves time.", "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=electric+cooker&type=1");
        saveVocab(lesson10, "smart clock", "/smɑːt klɒk/", "đồng hồ thông minh (n)", "A smart clock can remind you of your schedule.", "https://images.unsplash.com/photo-1550534791-2677533605ab?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=smart+clock&type=1");
        saveVocab(lesson10, "ocean", "/ˈəʊ.ʃən/", "đại dương (n)", "We may live under the ocean in the future.", "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=ocean&type=1");
        saveVocab(lesson10, "cottage", "/ˈkɒt.ɪdʒ/", "nhà tranh, nhà nhỏ (n)", "She lives in a small cottage in the countryside.", "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=cottage&type=1");
        saveVocab(lesson10, "helicopter", "/ˈhel.ɪˌkɒp.tər/", "máy bay trực thăng (n)", "The helicopter landed on the rooftop.", "https://images.unsplash.com/photo-1534790566855-4cb788d389ec?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=helicopter&type=1");
        saveVocab(lesson10, "washing machine", "/ˈwɒʃ.ɪŋ məˈʃiːn/", "máy giặt (n)", "The washing machine is very useful.", "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=washing+machine&type=1");

        Question q10_1 = saveQuestion(lesson10, "MULTIPLE_CHOICE", "Energy from the sun is called ___.");
        saveOption(q10_1, "solar energy", true);
        saveOption(q10_1, "wireless energy", false);
        saveOption(q10_1, "hi-tech energy", false);
        saveOption(q10_1, "space energy", false);
        Question q10_2 = saveQuestion(lesson10, "TRUE_FALSE", "'Wireless' means 'having no wires or cables'.");
        saveOption(q10_2, "True", true);
        saveOption(q10_2, "False", false);
        Question q10_3 = saveQuestion(lesson10, "MULTIPLE_CHOICE", "A small house in the countryside is called a ___.");
        saveOption(q10_3, "space station", false);
        saveOption(q10_3, "cottage", true);
        saveOption(q10_3, "UFO", false);
        saveOption(q10_3, "helicopter", false);
        Question q10_4 = saveQuestion(lesson10, "MULTIPLE_CHOICE", "'Công việc nhà' in English is ___.");
        saveOption(q10_4, "homework", false);
        saveOption(q10_4, "housework", true);
        saveOption(q10_4, "teamwork", false);
        saveOption(q10_4, "network", false);

        // LESSON 11: Our Greener World
        Lesson lesson11 = lessonRepository.save(Lesson.builder()
                .title("Unit 11: Our Greener World").topic(topicHK2)
                .contentHtml("<h2>Our Greener World - Thế giới xanh hơn</h2><p>Tìm hiểu về bảo vệ môi trường, tái chế và cách sống xanh.</p><h3>Grammar Focus</h3><ul><li>Conditional sentences type 1 (If...will...)</li><li>Suggestions: Let's..., How about...?, Why don't we...?</li></ul>")
                .difficultyLevel(3).orderIndex(11).isPublished(true).build());
        saveVocab(lesson11, "reduce", "/rɪˈdjuːs/", "giảm thiểu (v)", "We should reduce plastic waste.", "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=reduce&type=1");
        saveVocab(lesson11, "reuse", "/ˌriːˈjuːz/", "tái sử dụng (v)", "We can reuse these bags.", "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=reuse&type=1");
        saveVocab(lesson11, "recycle", "/ˌriːˈsaɪ.kəl/", "tái chế (v)", "Remember to recycle paper and glass.", "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=recycle&type=1");
        saveVocab(lesson11, "environment", "/ɪnˈvaɪ.rən.mənt/", "môi trường (n)", "We must protect the environment.", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=environment&type=1");
        saveVocab(lesson11, "plastic", "/ˈplæs.tɪk/", "nhựa, làm bằng nhựa (n/adj)", "Don't use too many plastic bags.", "https://bizweb.dktcdn.net/100/372/004/files/huong-dan-cach-lam-long-den-bang-chai-nhua-don-gian-tai-nha.jpg?v=1693539519029", "https://dict.youdao.com/dictvoice?audio=plastic&type=1");
        saveVocab(lesson11, "litter", "/ˈlɪt.ər/", "xả rác (v)", "Don't litter on the street.", "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=litter&type=1");
        saveVocab(lesson11, "rubbish", "/ˈrʌb.ɪʃ/", "rác (n)", "Put the rubbish in the bin.", "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=rubbish&type=1");
        saveVocab(lesson11, "recycling bin", "/riːˈsaɪ.klɪŋ bɪn/", "thùng tái chế (n)", "Throw it in the recycling bin.", "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=recycling+bin&type=1");
        saveVocab(lesson11, "reusable", "/ˌriːˈjuː.zə.bəl/", "có thể tái sử dụng (adj)", "Use a reusable bottle instead of plastic.", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=reusable&type=1");
        saveVocab(lesson11, "go green", "/ɡəʊ ɡriːn/", "sống xanh (v phrase)", "Let's go green and save our planet!", "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=go+green&type=1");
        saveVocab(lesson11, "climate change", "/ˈklaɪ.mət tʃeɪndʒ/", "biến đổi khí hậu (n)", "Climate change is a global problem.", "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=climate+change&type=1");
        saveVocab(lesson11, "renewable energy", "/rɪˈnjuː.ə.bəl ˈen.ə.dʒi/", "năng lượng tái tạo (n)", "Renewable energy comes from the sun and wind.", "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=renewable+energy&type=1");
        saveVocab(lesson11, "conserve", "/kənˈsɜːv/", "bảo tồn, tiết kiệm (v)", "We should conserve water and electricity.", "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=conserve&type=1");
        saveVocab(lesson11, "plant", "/plɑːnt/", "trồng cây (v)", "She planted a tree in the garden.", "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=plant&type=1");

        Question q11_1 = saveQuestion(lesson11, "MULTIPLE_CHOICE", "The 3Rs stand for Reduce, Reuse and ___.");
        saveOption(q11_1, "Return", false);
        saveOption(q11_1, "Remove", false);
        saveOption(q11_1, "Recycle", true);
        saveOption(q11_1, "Rebuild", false);
        Question q11_2 = saveQuestion(lesson11, "TRUE_FALSE", "'Litter' means 'xả rác' in Vietnamese.");
        saveOption(q11_2, "True", true);
        saveOption(q11_2, "False", false);
        Question q11_3 = saveQuestion(lesson11, "MULTIPLE_CHOICE", "We put recyclable waste in a ___.");
        saveOption(q11_3, "rubbish bag", false);
        saveOption(q11_3, "recycling bin", true);
        saveOption(q11_3, "plastic bag", false);
        saveOption(q11_3, "dustpan", false);
        Question q11_4 = saveQuestion(lesson11, "MULTIPLE_CHOICE", "Which phrase means 'sống xanh'?");
        saveOption(q11_4, "go red", false);
        saveOption(q11_4, "go blue", false);
        saveOption(q11_4, "go green", true);
        saveOption(q11_4, "go clean", false);

        // LESSON 12: Robots
        Lesson lesson12 = lessonRepository.save(Lesson.builder()
                .title("Unit 12: Robots").topic(topicHK2)
                .contentHtml("<h2>Robots - Người máy</h2><p>Tìm hiểu về robot, vai trò của robot trong cuộc sống và tương lai của công nghệ.</p><h3>Grammar Focus</h3><ul><li>Could / Couldn't for past ability</li><li>Will be able to for future ability</li></ul>")
                .difficultyLevel(3).orderIndex(12).isPublished(true).build());
        saveVocab(lesson12, "do the dishes", "/duː ðə ˈdɪʃ.ɪz/", "rửa bát (v phrase)", "The robot can do the dishes.", "https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=do+the+dishes&type=1");
        saveVocab(lesson12, "do the washing", "/duː ðə ˈwɒʃ.ɪŋ/", "giặt giũ (v phrase)", "The robot will do the washing for us.", "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=do+the+washing&type=1");
        saveVocab(lesson12, "guard", "/ɡɑːd/", "bảo vệ, canh gác (v)", "This robot can guard the house.", "https://bizweb.dktcdn.net/100/344/834/files/an-toan-lao-dong-bao-ho-thang-long-blog-95.jpg?v=1602582949904", "https://dict.youdao.com/dictvoice?audio=guard&type=1");
        saveVocab(lesson12, "repair", "/rɪˈpeər/", "sửa chữa (v)", "The robot can repair broken things.", "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=repair&type=1");
        saveVocab(lesson12, "move heavy things", "/muːv ˈhev.i θɪŋz/", "di chuyển đồ vật nặng (v phrase)", "A robot can move heavy things easily.", "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=move+heavy+things&type=1");
        saveVocab(lesson12, "make meals", "/meɪk miːlz/", "nấu ăn (v phrase)", "The robot helps make meals every day.", "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=make+meals&type=1");
        saveVocab(lesson12, "water", "/ˈwɔː.tər/", "tưới nước (v)", "She told the robot to water the flowers.", "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=water&type=1");
        saveVocab(lesson12, "put away", "/pʊt əˈweɪ/", "cất, dọn dẹp (v phrase)", "Please put away your toys.", "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=put+away&type=1");
        saveVocab(lesson12, "iron", "/ˈaɪ.ən/", "là, ủi (quần áo) (v)", "The robot can iron clothes quickly.", "https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=iron&type=1");
        saveVocab(lesson12, "useful", "/ˈjuːs.fəl/", "hữu ích (adj)", "Robots are very useful in factories.", "https://images.unsplash.com/photo-1563207153-f403bf289096?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=useful&type=1");
        saveVocab(lesson12, "height", "/haɪt/", "chiều cao (n)", "The robot's height is 1.5 meters.", "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=height&type=1");
        saveVocab(lesson12, "weight", "/weɪt/", "trọng lượng, cân nặng (n)", "The weight of the robot is 50 kilograms.", "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=weight&type=1");
        saveVocab(lesson12, "feelings", "/ˈfiː.lɪŋz/", "cảm xúc (n)", "The robot can understand human feelings.", "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=feelings&type=1");
        saveVocab(lesson12, "planet", "/ˈplæn.ɪt/", "hành tinh (n)", "Robots might live on another planet.", "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400&h=300&fit=crop", "https://dict.youdao.com/dictvoice?audio=planet&type=1");

        Question q12_1 = saveQuestion(lesson12, "MULTIPLE_CHOICE", "A robot can ___ clothes for us.");
        saveOption(q12_1, "iron", true);
        saveOption(q12_1, "guard", false);
        saveOption(q12_1, "water", false);
        saveOption(q12_1, "plant", false);
        Question q12_2 = saveQuestion(lesson12, "TRUE_FALSE", "'Repair' means 'sửa chữa' in Vietnamese.");
        saveOption(q12_2, "True", true);
        saveOption(q12_2, "False", false);
        Question q12_3 = saveQuestion(lesson12, "MULTIPLE_CHOICE", "The ___ of the robot is 50 kilograms.");
        saveOption(q12_3, "height", false);
        saveOption(q12_3, "weight", true);
        saveOption(q12_3, "price", false);
        saveOption(q12_3, "age", false);
        Question q12_4 = saveQuestion(lesson12, "MULTIPLE_CHOICE", "Which is NOT something a robot can do?");
        saveOption(q12_4, "do the dishes", false);
        saveOption(q12_4, "iron clothes", false);
        saveOption(q12_4, "have feelings", true);
        saveOption(q12_4, "guard the house", false);

        return List.of(lesson7, lesson8, lesson9, lesson10, lesson11, lesson12);
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

    private void saveVocab(Lesson lesson, String word, String pronunciation, String meaning, String example,
                           String imageUrl, String audioUrl) {
        vocabularyRepository.save(Vocabulary.builder()
                .lesson(lesson).word(word).pronunciation(pronunciation)
                .meaning(meaning).exampleSentence(example)
                .imageUrl(imageUrl).audioUrl(audioUrl).build());
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

