package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.CreateUserRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.UserResponse;
import com.englishlearn.application.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
     * GET /api/v1/users/{id} - Lấy thông tin user theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SCHOOL')")
    @Operation(summary = "Lấy thông tin người dùng theo ID")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /**
     * GET /api/v1/users - Lấy danh sách tất cả users (phân trang)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SCHOOL')")
    @Operation(summary = "Lấy danh sách người dùng (phân trang)")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAll(Pageable pageable) {
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
            @RequestBody @Valid CreateUserRequest request) {
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
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa người dùng"));
    }

    /**
     * PATCH /api/v1/users/me - Cập nhật profile của user hiện tại
     */
    @PatchMapping("/me")
    @Operation(summary = "Cập nhật thông tin cá nhân")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String avatarUrl) {
        UserResponse currentUser = userService.getUserByUsername(userDetails.getUsername());
        UserResponse updatedUser = userService.updateProfile(currentUser.getId(), fullName, avatarUrl);
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
}
