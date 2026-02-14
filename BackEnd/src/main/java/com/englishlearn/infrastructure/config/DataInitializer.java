package com.englishlearn.infrastructure.config;

import com.englishlearn.domain.entity.Role;
import com.englishlearn.infrastructure.persistence.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Data Initializer - Tạo dữ liệu mặc định khi khởi động ứng dụng
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final RoleRepository roleRepository;
    private final com.englishlearn.infrastructure.persistence.UserRepository userRepository;
    private final com.englishlearn.infrastructure.persistence.SchoolRepository schoolRepository;
    private final com.englishlearn.infrastructure.persistence.ClassRoomRepository classRoomRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // 1. Init Roles
            createRoleIfNotExists(Role.ADMIN, "Quản trị viên hệ thống");
            createRoleIfNotExists(Role.SCHOOL, "Quản lý trường học");
            createRoleIfNotExists(Role.TEACHER, "Giáo viên");
            createRoleIfNotExists(Role.STUDENT, "Học sinh");
            log.info("✅ Default roles initialized successfully!");

            // 2. Init Mock School A
            com.englishlearn.domain.entity.School schoolA = schoolRepository.findByName("THPT Chu Van An").orElse(null);
            if (schoolA == null) {
                schoolA = com.englishlearn.domain.entity.School.builder()
                        .name("THPT Chu Van An")
                        .address("Ha Noi")
                        .email("cva@example.com")
                        .phone("0123456789")
                        .isActive(true)
                        .build();
                schoolA = schoolRepository.save(schoolA);
                log.info("Created mock school: {}", schoolA.getName());
            }

            // Init School Admin User for School A
            createUserIfNotExists("school_admin", "password", "Hieu Truong", "school_admin@example.com", Role.SCHOOL, schoolA);

            // Init Mock Classes for School A
            createClassRoomIfNotExists(schoolA, "10A1", "2023-2024");
            createClassRoomIfNotExists(schoolA, "11B2", "2023-2024");
            
            // Init Users for School A
            createUserIfNotExists("teacher1", "password", "Nguyen Van A", "teacher1@example.com", Role.TEACHER, schoolA);
            createUserIfNotExists("student1", "password", "Tran Van B", "student1@example.com", Role.STUDENT, schoolA);
            
            // 3. Init School B (To verify isolation)
            com.englishlearn.domain.entity.School schoolB = schoolRepository.findByName("THPT Nguyen Trai").orElse(null);
            if (schoolB == null) {
                schoolB = com.englishlearn.domain.entity.School.builder()
                        .name("THPT Nguyen Trai")
                        .address("Da Nang")
                        .email("nguyentrai@example.com")
                        .phone("0987654321")
                        .isActive(true)
                        .build();
                schoolB = schoolRepository.save(schoolB);
                log.info("Created mock school: {}", schoolB.getName());
            }
            
            createUserIfNotExists("school_admin_b", "password", "Hieu Truong Nguyen Trai", "school_b@example.com", Role.SCHOOL, schoolB);
            createClassRoomIfNotExists(schoolB, "10C1", "2023-2024");
            createUserIfNotExists("teacher_b", "password", "Giao Vien B", "teacher_b@example.com", Role.TEACHER, schoolB);
            createUserIfNotExists("student_b", "password", "Hoc Sinh B", "student_b@example.com", Role.STUDENT, schoolB);

            // 4. Init Admin User (Global)
            createUserIfNotExists("admin", "password", "Admin System", "admin@example.com", Role.ADMIN, null);
        };
    }

    private void createRoleIfNotExists(String roleName, String description) {
        if (!roleRepository.existsByName(roleName)) {
            Role role = Role.builder()
                    .name(roleName)
                    .description(description)
                    .build();
            roleRepository.save(role);
        }
    }

    private void createUserIfNotExists(String username, String password, String fullName, String email, String roleName, com.englishlearn.domain.entity.School school) {
        if (!userRepository.existsByUsername(username)) {
            Role role = roleRepository.findByName(roleName).orElse(null);
            if (role != null) {
                com.englishlearn.domain.entity.User user = com.englishlearn.domain.entity.User.builder()
                        .username(username)
                        .passwordHash(passwordEncoder.encode(password))
                        .fullName(fullName)
                        .email(email)
                        .isActive(true)
                        .school(school)
                        .roles(java.util.Collections.singleton(role))
                        .build();
                userRepository.save(user);
                log.info("Created user: {}", username);
            }
        }
    }

    private void createClassRoomIfNotExists(com.englishlearn.domain.entity.School school, String name, String academicYear) {
         if (!classRoomRepository.existsByNameAndSchoolId(name, school.getId())) {
             com.englishlearn.domain.entity.ClassRoom classRoom = com.englishlearn.domain.entity.ClassRoom.builder()
                     .name(name)
                     .school(school)
                     .academicYear(academicYear)
                     .isActive(true)
                     .build();
             classRoomRepository.save(classRoom);
             log.info("Created class: {}", name);
         }
    }
}
