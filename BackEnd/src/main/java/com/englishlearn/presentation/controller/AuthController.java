package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.ForgotPasswordRequest;
import com.englishlearn.application.dto.request.LoginRequest;
import com.englishlearn.application.dto.request.RegisterRequest;
import com.englishlearn.application.dto.request.ResetPasswordRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.AuthResponse;
import com.englishlearn.application.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
            @RequestBody @Valid LoginRequest request,
            HttpServletRequest httpServletRequest) {
        AuthResponse response = authService.login(request, httpServletRequest);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    /**
     * POST /api/v1/auth/refresh-token - Làm mới access token
     */
    @PostMapping("/refresh-token")
    @Operation(summary = "Làm mới access token bằng refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @RequestBody java.util.Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Refresh token không được để trống"));
        }
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Làm mới token thành công", response));
    }

    /**
     * POST /api/v1/auth/logout - Đăng xuất (invalidate token phía client)
     */
    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // JWT là stateless - client tự xóa token
        // Nếu cần blacklist token, có thể lưu vào Redis/DB
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công"));
    }

    /**
     * GET /api/v1/auth/health - Kiểm tra server hoạt động
     */
    @GetMapping("/health")
    @Operation(summary = "Kiểm tra trạng thái server")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    /**
     * POST /api/v1/auth/forgot-password - Gửi OTP về email
     */
    @PostMapping("/forgot-password")
    @Operation(summary = "Quên mật khẩu - Gửi OTP về email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @RequestBody @Valid ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        // Luôn trả về thành công để không tiết lộ email có tồn tại không
        return ResponseEntity
                .ok(ApiResponse.success("Nếu email tồn tại, mã OTP đã được gửi. Vui lòng kiểm tra hộp thư."));
    }

    /**
     * POST /api/v1/auth/reset-password - Đặt lại mật khẩu bằng OTP
     */
    @PostMapping("/reset-password")
    @Operation(summary = "Reset mật khẩu bằng mã OTP")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestBody @Valid ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."));
    }

    /**
     * POST /api/v1/auth/google - Đăng nhập bằng Google
     */
    @PostMapping("/google")
    @Operation(summary = "Đăng nhập bằng Google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @RequestBody @Valid com.englishlearn.application.dto.request.GoogleLoginRequest request) {
        AuthResponse response = authService.googleLogin(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập Google thành công", response));
    }
}
