package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.LoginRequest;
import com.englishlearn.application.dto.request.RegisterRequest;
import com.englishlearn.application.dto.request.ResetPasswordRequest;
import com.englishlearn.application.dto.response.AuthResponse;
import com.englishlearn.domain.entity.PasswordResetToken;
import com.englishlearn.domain.entity.Role;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.exception.DuplicateResourceException;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.PasswordResetTokenRepository;
import com.englishlearn.infrastructure.persistence.RoleRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import com.englishlearn.infrastructure.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Tài khoản", "username", request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Tài khoản", "email", request.getEmail());
        }

        // Assign Role
        String roleName = request.getRole() != null ? "ROLE_" + request.getRole().toUpperCase() : Role.STUDENT;
        Role userRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Vai trò", "name", roleName));

        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .isActive(true)
                .build();

        user.getRoles().add(userRole);

        var savedUser = userRepository.save(user);

        return buildAuthResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request, HttpServletRequest httpServletRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));

        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản", "username", request.getUsername()));

        // Log the login event
        String ipAddress = httpServletRequest.getRemoteAddr();
        String userAgent = httpServletRequest.getHeader("User-Agent");
        auditLogService.log(user.getId(), "LOGIN", "Đăng nhập thành công", ipAddress, userAgent);

        return buildAuthResponse(user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản", "username", username));

        var userDetails = buildUserDetails(user);

        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new RuntimeException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        var newAccessToken = jwtService.generateToken(userDetails);
        var newRefreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                .build();
    }

    /**
     * Quên mật khẩu - Sinh OTP 6 số, lưu DB, gửi email HTML
     * Luôn trả về success để không tiết lộ email có tồn tại không
     */
    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            // Xóa token cũ (nếu có)
            passwordResetTokenRepository.deleteAllByUser(user);

            // Sinh OTP 6 số ngẫu nhiên
            String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));

            // Lưu token, hết hạn sau 10 phút
            PasswordResetToken token = PasswordResetToken.builder()
                    .user(user)
                    .otp(otp)
                    .expiredAt(LocalDateTime.now().plusMinutes(10))
                    .build();
            passwordResetTokenRepository.save(token);

            // Gửi email HTML (async)
            emailService.sendOtpEmail(user.getEmail(), user.getFullName(), otp);
        });
    }

    /**
     * Reset mật khẩu bằng OTP
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // Validate OTP
        PasswordResetToken token = passwordResetTokenRepository
                .findByOtpAndUsedFalse(request.getOtp())
                .orElseThrow(() -> new RuntimeException("Mã OTP không hợp lệ hoặc đã được sử dụng"));

        // Kiểm tra hết hạn
        if (LocalDateTime.now().isAfter(token.getExpiredAt())) {
            throw new RuntimeException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
        }

        // Validate confirm password
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }

        // Cập nhật mật khẩu
        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Đánh dấu token đã dùng
        token.setUsed(true);
        passwordResetTokenRepository.save(token);
    }

    @Transactional
    public AuthResponse googleLogin(com.englishlearn.presentation.dto.request.GoogleLoginRequest request) {
        try {
            // Using Access Token to fetch user profile via Google OAuth2 api
            String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
            com.google.api.client.http.HttpRequestFactory requestFactory = new NetHttpTransport().createRequestFactory();
            com.google.api.client.http.HttpRequest httpRequest = requestFactory.buildGetRequest(new com.google.api.client.http.GenericUrl(userInfoUrl));
            httpRequest.getHeaders().setAuthorization("Bearer " + request.getAccessToken());

            com.google.api.client.http.HttpResponse httpResponse = httpRequest.execute();
            String jsonResponse = httpResponse.parseAsString();
            
            // Parse JSON manually
            com.google.gson.JsonObject payload = com.google.gson.JsonParser.parseString(jsonResponse).getAsJsonObject();

            if (!payload.has("email")) {
                throw new RuntimeException("Không tìm thấy Email từ Google Account");
            }
            
            String email = payload.get("email").getAsString();
            String name = payload.has("name") ? payload.get("name").getAsString() : "Người dùng Google";
            String pictureUrl = payload.has("picture") ? payload.get("picture").getAsString() : null;

            // Tim xem DB đã có user này chưa
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                // Tạo user mới tự động với Role Default
                Role userRole = roleRepository.findByName(Role.STUDENT)
                        .orElseThrow(() -> new ResourceNotFoundException("Vai trò", "name", Role.STUDENT));

                // Username lấy phần trước @ của email (ví dụ: nguyenphong@... -> nguyenphong)
                // Cần đảm bảo duy nhất
                String baseUsername = email.split("@")[0];
                String username = baseUsername;
                int suffix = 1;
                while (userRepository.existsByUsername(username)) {
                    username = baseUsername + suffix++;
                }

                user = User.builder()
                        .username(username)
                        .email(email)
                        // Pass giả lập random (người dùng Google không cần password)
                        .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                        .fullName(name)
                        .avatarUrl(pictureUrl)
                        .isActive(true)
                        .build();

                user.getRoles().add(userRole);
                user = userRepository.save(user);
            }

            return buildAuthResponse(user);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi xác thực Google: " + e.getMessage());
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        var userDetails = buildUserDetails(user);
        var accessToken = jwtService.generateToken(userDetails);
        var refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                .build();
    }

    private org.springframework.security.core.userdetails.User buildUserDetails(User user) {
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPasswordHash(),
                user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority(role.getName()))
                        .collect(Collectors.toList()));
    }
}
