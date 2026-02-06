package com.englishlearn.config;

import com.englishlearn.entity.Role;
import com.englishlearn.repository.RoleRepository;
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

    @Bean
    public CommandLineRunner initRoles() {
        return args -> {
            // Tạo các role mặc định nếu chưa tồn tại
            createRoleIfNotExists(Role.ADMIN, "Quản trị viên hệ thống");
            createRoleIfNotExists(Role.SCHOOL, "Quản lý trường học");
            createRoleIfNotExists(Role.TEACHER, "Giáo viên");
            createRoleIfNotExists(Role.STUDENT, "Học sinh");

            log.info("✅ Default roles initialized successfully!");
        };
    }

    private void createRoleIfNotExists(String roleName, String description) {
        if (!roleRepository.existsByName(roleName)) {
            Role role = Role.builder()
                    .name(roleName)
                    .description(description)
                    .build();
            roleRepository.save(role);
            log.info("Created role: {}", roleName);
        }
    }
}
