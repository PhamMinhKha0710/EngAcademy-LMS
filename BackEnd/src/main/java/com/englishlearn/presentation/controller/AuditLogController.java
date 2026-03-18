package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.AuditLogResponse;
import com.englishlearn.application.service.AuditLogService;
import com.englishlearn.domain.entity.User;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'SCHOOL')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getRecentLogs(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        List<AuditLogResponse> logs = auditLogService.getRecentLogsByUser(user);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử hoạt động thành công", logs));
    }
}
