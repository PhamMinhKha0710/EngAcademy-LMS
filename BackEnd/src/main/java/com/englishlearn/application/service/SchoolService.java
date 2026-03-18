package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.SchoolRequest;
import com.englishlearn.application.dto.response.SchoolResponse;
import com.englishlearn.domain.entity.Role;
import com.englishlearn.domain.entity.School;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.exception.ApiException;
import com.englishlearn.domain.exception.DuplicateResourceException;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.RoleRepository;
import com.englishlearn.infrastructure.persistence.SchoolRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SchoolService {

    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<SchoolResponse> getAllSchools() {
        return schoolRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<SchoolResponse> getActiveSchools(Pageable pageable) {
        return schoolRepository.findByIsActiveTrue(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public SchoolResponse getSchoolById(Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trường học", "id", id));
        return mapToResponse(school);
    }

    @Transactional(readOnly = true)
    public List<SchoolResponse> searchSchools(String name) {
        return schoolRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SchoolResponse createSchool(SchoolRequest request) {
        // Check duplicate email for school
        if (request.getEmail() != null && schoolRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Trường học", "email", request.getEmail());
        }

        // Validate manager account details
        if (request.getManagerUsername() == null || request.getManagerUsername().trim().length() < 3) {
            throw ApiException.badRequest("Tên đăng nhập quản lý phải có ít nhất 3 ký tự");
        }
        if (request.getManagerPassword() == null || request.getManagerPassword().length() < 6) {
            throw ApiException.badRequest("Mật khẩu quản lý phải có ít nhất 6 ký tự");
        }

        // Check duplicate username for manager account
        if (userRepository.existsByUsername(request.getManagerUsername())) {
            throw new DuplicateResourceException("Tài khoản quản lý", "username", request.getManagerUsername());
        }

        // 1. Create and save the school
        School school = School.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .email(request.getEmail())
                .trialEndDate(request.getTrialEndDate())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        School savedSchool = schoolRepository.save(school);
        log.info("Created new school: {} (ID: {})", savedSchool.getName(), savedSchool.getId());

        // 2. Create the school manager account (ROLE_SCHOOL)
        Role schoolRole = roleRepository.findByName("ROLE_SCHOOL")
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy vai trò ROLE_SCHOOL"));

        Set<Role> roles = new HashSet<>();
        roles.add(schoolRole);

        User manager = User.builder()
                .username(request.getManagerUsername())
                .passwordHash(passwordEncoder.encode(request.getManagerPassword()))
                .email(request.getEmail()) // Use school email as manager email too
                .fullName("Quản lý " + request.getName())
                .isActive(true)
                .school(savedSchool)
                .roles(roles)
                .coins(0)
                .streakDays(0)
                .build();

        userRepository.save(manager);
        log.info("Created manager account '{}' for school '{}'", manager.getUsername(), savedSchool.getName());

        return mapToResponse(savedSchool);
    }

    @Transactional
    public SchoolResponse updateSchool(Long id, SchoolRequest request) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trường học", "id", id));

        // Check duplicate email (excluding current school)
        if (request.getEmail() != null && !request.getEmail().equals(school.getEmail())) {
            if (schoolRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Trường học", "email", request.getEmail());
            }
        }

        school.setName(request.getName());
        school.setAddress(request.getAddress());
        school.setPhone(request.getPhone());
        school.setEmail(request.getEmail());
        school.setTrialEndDate(request.getTrialEndDate());

        if (request.getIsActive() != null) {
            school.setIsActive(request.getIsActive());
        }

        School updatedSchool = schoolRepository.save(school);
        log.info("Updated school: {} (ID: {})", updatedSchool.getName(), updatedSchool.getId());

        return mapToResponse(updatedSchool);
    }

    @Transactional
    public void deleteSchool(Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trường học", "id", id));

        // Soft delete
        school.setIsActive(false);
        schoolRepository.save(school);
        log.info("Soft deleted school: {} (ID: {})", school.getName(), school.getId());
    }

    @Transactional
    public void hardDeleteSchool(Long id) {
        if (!schoolRepository.existsById(id)) {
            throw new ResourceNotFoundException("Trường học", "id", id);
        }
        schoolRepository.deleteById(id);
        log.info("Hard deleted school with ID: {}", id);
    }

    private SchoolResponse mapToResponse(School school) {
        Long teacherCount = schoolRepository.countTeachersBySchoolId(school.getId());
        Long studentCount = schoolRepository.countStudentsBySchoolId(school.getId());
        Long classCount = schoolRepository.countClassesBySchoolId(school.getId());

        return SchoolResponse.builder()
                .id(school.getId())
                .name(school.getName())
                .address(school.getAddress())
                .phone(school.getPhone())
                .email(school.getEmail())
                .isActive(school.getIsActive())
                .trialEndDate(school.getTrialEndDate())
                .createdAt(school.getCreatedAt())
                .teacherCount(teacherCount != null ? teacherCount : 0L)
                .studentCount(studentCount != null ? studentCount : 0L)
                .classCount(classCount != null ? classCount : 0L)
                .build();
    }
}
