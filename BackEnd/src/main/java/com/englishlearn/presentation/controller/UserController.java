package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.ChangePasswordRequest;
import com.englishlearn.application.dto.request.CreateUserRequest;
import com.englishlearn.application.dto.request.UpdateUserRequest;
import com.englishlearn.application.dto.response.AdminUserStatsResponse;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.AuditLogResponse;
import com.englishlearn.application.dto.response.UserResponse;
import com.englishlearn.application.service.AuditLogService;
import com.englishlearn.application.service.UserService;
import com.englishlearn.domain.entity.User;
import com.englishlearn.infrastructure.persistence.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * User Controller - Quản lý người dùng
 * 
 * RESTful API Endpoints:
 * ======================
 * GET /api/v1/users/me - Lấy thông tin user hiện tại
 * GET /api/v1/users - Lấy danh sách users (Admin)
 * GET /api/v1/users/{id} - Lấy user theo ID
 * PATCH /api/v1/users/me - Cập nhật profile của mình
 * POST /api/v1/users/{id}/coins - Thêm xu cho user (Admin/Teacher)
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "API quản lý người dùng")
public class UserController {

    private final UserService userService;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    /**
     * GET /api/v1/users/me - Lấy thông tin user đang đăng nhập
     */
    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin người dùng hiện tại")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponse user = userService.getUserByUsername(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /**
     * GET /api/v1/users/me/audit-logs - Lấy nhật ký hoạt động của mình
     */
    @GetMapping("/me/audit-logs")
    @Operation(summary = "Lấy nhật ký hoạt động của mình")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getMyAuditLogs(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<AuditLogResponse> logs = auditLogService.getRecentLogsByUser(user);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    /**
     * GET /api/v1/users/{id} - Lấy thông tin user theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SCHOOL')")
    @Operation(summary = "Lấy thông tin người dùng theo ID")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponse currentUser = userService.getUserByUsername(userDetails.getUsername());
        UserResponse user = userService.getUserById(id);

        // Security check for SCHOOL role
        if (currentUser.getRoles().contains("ROLE_SCHOOL")) {
            if (currentUser.getSchoolId() == null || !currentUser.getSchoolId().equals(user.getSchoolId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Không có quyền truy cập người dùng này", null));
            }
        }

        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /**
     * GET /api/v1/users - Lấy danh sách tất cả users (phân trang)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SCHOOL')")
    @Operation(summary = "Lấy danh sách người dùng (phân trang)")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAll(
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {

        UserResponse currentUser = userService.getUserByUsername(userDetails.getUsername());

        // Filter by school if user has ROLE_SCHOOL
        if (currentUser.getRoles().contains("ROLE_SCHOOL")) {
            if (currentUser.getSchoolId() == null) {
                // Return empty page instead of 400 error
                return ResponseEntity.ok(ApiResponse.success(
                        "Tài khoản trường học chưa được liên kết với trường nào",
                        Page.empty(pageable)));
            }
            Page<UserResponse> users = userService.getAllUsersBySchool(currentUser.getSchoolId(), pageable);
            return ResponseEntity.ok(ApiResponse.success(users));
        }

        Page<UserResponse> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    /**
     * POST /api/v1/users - Tạo người dùng mới (Admin and School)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SCHOOL')")
    @Operation(summary = "Tạo người dùng mới")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @RequestBody @Valid CreateUserRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        UserResponse currentUser = userService.getUserByUsername(userDetails.getUsername());

        // If current user is SCHOOL admin, force the schoolId to be their own school
        if (currentUser.getRoles().contains("ROLE_SCHOOL")) {
            if (currentUser.getSchoolId() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Tài khoản trường học chưa được liên kết với trường nào", null));
            }
            request.setSchoolId(currentUser.getSchoolId());
        }

        UserResponse user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo người dùng thành công", user));
    }

    /**
     * DELETE /api/v1/users/{id} - Xóa người dùng (Admin and School)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SCHOOL')")
    @Operation(summary = "Xóa người dùng")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        UserResponse currentUser = userService.getUserByUsername(userDetails.getUsername());
        UserResponse targetUser = userService.getUserById(id);

        if (currentUser.getRoles().contains("ROLE_SCHOOL")) {
            if (currentUser.getSchoolId() == null || !currentUser.getSchoolId().equals(targetUser.getSchoolId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Bạn không có quyền xóa người dùng này", null));
            }
        }

        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa người dùng"));
    }

    /**
     * PUT /api/v1/users/{id} - Cập nhật người dùng (Admin and School)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SCHOOL')")
    @Operation(summary = "Cập nhật người dùng theo ID")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @RequestBody @Valid UpdateUserRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        UserResponse currentUser = userService.getUserByUsername(userDetails.getUsername());
        UserResponse targetUser = userService.getUserById(id);

        // Security check for SCHOOL role
        if (currentUser.getRoles().contains("ROLE_SCHOOL")) {
            if (currentUser.getSchoolId() == null || !currentUser.getSchoolId().equals(targetUser.getSchoolId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Không có quyền cập nhật người dùng này", null));
            }
        }

        UserResponse user = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật người dùng thành công", user));
    }

    /**
     * GET /api/v1/users/stats - Lấy thống kê người dùng cho Admin
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy thống kê người dùng (Admin only)")
    public ResponseEntity<ApiResponse<AdminUserStatsResponse>> getUserStats() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAdminStats()));
    }

    /**
     * PATCH /api/v1/users/me - Cập nhật profile của user hiện tại
     */
    @PatchMapping("/me")
    @Operation(summary = "Cập nhật thông tin cá nhân")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String avatarUrl,
            HttpServletRequest request) {
        UserResponse currentUser = userService.getUserByUsername(userDetails.getUsername());
        UserResponse updatedUser = userService.updateProfile(currentUser.getId(), fullName, avatarUrl);

        // Log action
        auditLogService.log(currentUser.getId(), "UPDATE_PROFILE", "Cập nhật thông tin cá nhân",
                request.getRemoteAddr(), request.getHeader("User-Agent"));

        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", updatedUser));
    }

    /**
     * POST /api/v1/users/{id}/coins - Thêm xu cho user
     */
    @PostMapping("/{id}/coins")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    @Operation(summary = "Thêm xu cho người dùng")
    public ResponseEntity<ApiResponse<Void>> addCoins(
            @PathVariable Long id,
            @RequestParam Integer amount) {
        userService.addCoins(id, amount);
        return ResponseEntity.ok(ApiResponse.success("Đã thêm " + amount + " xu"));
    }

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
    @Operation(summary = "Tìm kiếm học sinh")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> searchStudents(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {

        UserResponse currentUser = userService.getUserByUsername(userDetails.getUsername());
        Long schoolId = currentUser.getSchoolId();

        return ResponseEntity.ok(ApiResponse.success(userService.searchStudents(keyword, schoolId, pageable)));
    }

    /**
     * GET /api/v1/users/teachers - Tìm kiếm giáo viên
     */
    @GetMapping("/teachers")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")
    @Operation(summary = "Tìm kiếm giáo viên")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> searchTeachers(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {

        UserResponse currentUser = userService.getUserByUsername(userDetails.getUsername());
        Long schoolId = currentUser.getSchoolId();

        System.out.println(
                "DEBUG: User " + userDetails.getUsername() + " (School ID: " + schoolId + ") is searching teachers.");

        // Search for this user's school
        Page<UserResponse> teachers = userService.searchTeachers(keyword, schoolId, pageable);

        // Debug: also check if ANY teachers exist in system
        Page<UserResponse> allTeachersSystemWide = userService.searchTeachers("", null, Pageable.unpaged());
        System.out.println("DEBUG: Teachers found for School " + schoolId + ": " + teachers.getTotalElements());
        System.out.println("DEBUG: Total Teachers in System: " + allTeachersSystemWide.getTotalElements());

        return ResponseEntity.ok(ApiResponse.success(teachers));
    }

    /**
     * PATCH /api/v1/users/me/password - Đổi mật khẩu
     */
    @PatchMapping("/me/password")
    @Operation(summary = "Đổi mật khẩu")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid ChangePasswordRequest changePasswordRequest,
            HttpServletRequest request) {
        UserResponse currentUser = userService.getUserByUsername(userDetails.getUsername());
        userService.changePassword(currentUser.getId(), changePasswordRequest);

        // Log action
        auditLogService.log(currentUser.getId(), "CHANGE_PASSWORD", "Đổi mật khẩu thành công",
                request.getRemoteAddr(), request.getHeader("User-Agent"));

        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công"));
    }
}
