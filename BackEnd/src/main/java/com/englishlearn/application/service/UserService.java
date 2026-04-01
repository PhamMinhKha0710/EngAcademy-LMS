package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.ChangePasswordRequest;
import com.englishlearn.application.dto.request.CreateUserRequest;
import com.englishlearn.application.dto.request.UpdateUserRequest;
import com.englishlearn.application.dto.response.AdminUserStatsResponse;
import com.englishlearn.application.dto.response.UserResponse;
import com.englishlearn.domain.entity.ClassRoom;
import com.englishlearn.domain.entity.Role;
import com.englishlearn.domain.entity.StudentClass;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.exception.ApiException;
import com.englishlearn.domain.exception.DuplicateResourceException;
import com.englishlearn.infrastructure.persistence.ClassRoomRepository;
import com.englishlearn.infrastructure.persistence.RoleRepository;
import com.englishlearn.infrastructure.persistence.SchoolRepository;
import com.englishlearn.infrastructure.persistence.StudentClassRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SchoolRepository schoolRepository;
    private final ClassRoomRepository classRoomRepository;
    private final StudentClassRepository studentClassRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng với ID: " + id));
        return mapToResponse(user);
    }

    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng: " + username));
        return mapToResponse(user);
    }

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        // Validate username uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Tài khoản", "username", request.getUsername());
        }

        // Validate email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Tài khoản", "email", request.getEmail());
        }

        // Build user entity
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .coins(0)
                .streakDays(0)
                .isActive(true)
                .roles(new HashSet<>())
                .build();

        // Assign school if provided
        if (request.getSchoolId() != null) {
            com.englishlearn.domain.entity.School school = schoolRepository.findById(request.getSchoolId())
                    .orElseThrow(
                            () -> ApiException.notFound("Không tìm thấy trường học với ID: " + request.getSchoolId()));
            user.setSchool(school);
        }

        // Assign roles
        for (String roleName : request.getRoles()) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy vai trò: " + roleName));
            user.getRoles().add(role);
        }

        User savedUser = userRepository.save(user);
        log.info("Created new user: {} with roles: {}", savedUser.getUsername(), request.getRoles());

        // Assign to class if student and classId provided
        if (request.getRoles().contains(Role.STUDENT) && request.getClassId() != null) {
            ClassRoom classRoom = classRoomRepository.findById(request.getClassId())
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy lớp học với ID: " + request.getClassId()));
            
            StudentClass studentClass = StudentClass.builder()
                    .student(savedUser)
                    .classRoom(classRoom)
                    .status("ACTIVE")
                    .build();
            studentClassRepository.save(studentClass);
            log.info("Assigned student {} to class {}", savedUser.getUsername(), classRoom.getName());
        }

        return mapToResponse(savedUser);
    }

    @Transactional
    public UserResponse updateProfile(Long userId, String fullName, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        if (fullName != null) {
            user.setFullName(fullName);
        }
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }

        User savedUser = userRepository.save(user);
        log.info("Updated profile for user: {}", userId);
        return mapToResponse(savedUser);
    }

    @Transactional
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng với ID: " + userId));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Tài khoản", "email", request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        if (request.getIsActive() != null)
            user.setIsActive(request.getIsActive());
        if (request.getCoins() != null)
            user.setCoins(request.getCoins());

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            user.getRoles().clear();
            for (String roleName : request.getRoles()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> ApiException.notFound("Không tìm thấy vai trò: " + roleName));
                user.getRoles().add(role);
            }
        }

        User savedUser = userRepository.save(user);
        log.info("Admin updated user: {}", userId);

        // Update class assignment if student and classId provided
        if (user.getRoles().stream().anyMatch(r -> r.getName().equals(Role.STUDENT)) && request.getClassId() != null) {
            ClassRoom classRoom = classRoomRepository.findById(request.getClassId())
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy lớp học với ID: " + request.getClassId()));
            
            // Check if already in this class
            if (!studentClassRepository.existsByStudentAndClassRoom(user, classRoom)) {
                // For simplicity, we just add to the new class. 
                // In a more complex system, we might want to deactivate old class enrollments.
                StudentClass studentClass = StudentClass.builder()
                        .student(user)
                        .classRoom(classRoom)
                        .status("ACTIVE")
                        .build();
                studentClassRepository.save(studentClass);
                log.info("Assigned student {} to new class {}", user.getUsername(), classRoom.getName());
            }
        }

        return mapToResponse(savedUser);
    }

    public AdminUserStatsResponse getAdminStats() {
        return new AdminUserStatsResponse(
                userRepository.count(),
                userRepository.countActiveUsers(),
                userRepository.countByRoleName(Role.TEACHER),
                userRepository.countByRoleName(Role.STUDENT),
                userRepository.sumTotalCoins() != null ? userRepository.sumTotalCoins() : 0L);
    }

    @Transactional
    public void addCoins(Long userId, Integer coins) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));
        user.setCoins((user.getCoins() != null ? user.getCoins() : 0) + coins);
        userRepository.save(user);
        log.info("Added {} coins to user {}", coins, userId);
    }

    @Transactional
    public void incrementStreak(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));
        user.setStreakDays((user.getStreakDays() != null ? user.getStreakDays() : 0) + 1);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        // Delete the user
        userRepository.delete(user);
        log.info("Deleted user: {} (ID: {})", user.getUsername(), userId);
    }

    public Page<UserResponse> getAllUsersBySchool(Long schoolId, Pageable pageable) {
        com.englishlearn.domain.entity.School school = new com.englishlearn.domain.entity.School();
        school.setId(schoolId);
        return userRepository.findAllBySchool(school, pageable).map(this::mapToResponse);
    }

    public Page<UserResponse> searchStudents(String keyword, Long schoolId, Pageable pageable) {
        return userRepository.searchStudents(keyword, schoolId, pageable).map(this::mapToResponse);
    }

    public Page<UserResponse> searchTeachers(String keyword, Long schoolId, Pageable pageable) {
        return userRepository.searchTeachers(keyword, schoolId, pageable).map(this::mapToResponse);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        // Validate old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw ApiException.badRequest("Mật khẩu cũ không chính xác");
        }

        // Validate password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw ApiException.badRequest("Mật khẩu xác nhận không khớp");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", userId);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .coins(user.getCoins())
                .streakDays(user.getStreakDays())
                .isActive(user.getIsActive())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                .schoolId(user.getSchool() != null ? user.getSchool().getId() : null)
                .schoolName(user.getSchool() != null ? user.getSchool().getName() : null)
                .classId(studentClassRepository.findByStudent(user).stream()
                        .filter(sc -> "ACTIVE".equals(sc.getStatus()))
                        .findFirst()
                        .map(sc -> sc.getClassRoom().getId())
                        .orElse(null))
                .className(studentClassRepository.findByStudent(user).stream()
                        .filter(sc -> "ACTIVE".equals(sc.getStatus()))
                        .findFirst()
                        .map(sc -> sc.getClassRoom().getName())
                        .orElse(null))
                .createdAt(user.getCreatedAt())
                .build();
    }
}
