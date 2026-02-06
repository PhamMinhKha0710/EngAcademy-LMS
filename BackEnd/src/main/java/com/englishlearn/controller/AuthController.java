package com.englishlearn.controller;

import com.englishlearn.dto.AuthResponse;
import com.englishlearn.dto.LoginRequest;
import com.englishlearn.dto.RegisterRequest;
import com.englishlearn.dto.response.ApiResponse;
import com.englishlearn.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Auth Controller - Xác thực người dùng
 * 
 * RESTful API Endpoints:
 * ======================
 * POST /api/v1/auth/register - Đăng ký tài khoản mới
 * POST /api/v1/auth/login - Đăng nhập
 * POST /api/v1/auth/refresh - Làm mới token (future)
 * POST /api/v1/auth/logout - Đăng xuất (future)
 * GET /api/v1/auth/health - Kiểm tra trạng thái server
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "API xác thực người dùng")
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/v1/auth/register - Đăng ký tài khoản mới
     */
    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản mới")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @RequestBody @Valid RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký thành công", response));
    }

    /**
     * POST /api/v1/auth/login - Đăng nhập
     */
    @PostMapping("/login")
    @Operation(summary = "Đăng nhập")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @RequestBody @Valid LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    /**
     * GET /api/v1/auth/health - Kiểm tra server hoạt động
     */
    @GetMapping("/health")
    @Operation(summary = "Kiểm tra trạng thái server")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Server đang hoạt động", "OK"));
    }
}
