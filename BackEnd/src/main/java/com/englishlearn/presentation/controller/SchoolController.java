package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.SchoolRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.SchoolResponse;
import com.englishlearn.application.service.SchoolService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schools")
@RequiredArgsConstructor
@Tag(name = "School Management", description = "APIs for managing schools")
public class SchoolController {

    private final SchoolService schoolService;
    private final com.englishlearn.application.service.UserService userService;
    private final com.englishlearn.application.service.AuditLogService auditLogService;
    private final com.englishlearn.infrastructure.persistence.UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")
    @Operation(summary = "Get all schools", description = "Retrieve all schools (Admin/School only)")
    public ResponseEntity<ApiResponse<List<SchoolResponse>>> getAllSchools() {
        List<SchoolResponse> schools = schoolService.getAllSchools();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách trường học thành công", schools));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")
    @Operation(summary = "Get active schools with pagination")
    public ResponseEntity<ApiResponse<Page<SchoolResponse>>> getActiveSchools(Pageable pageable) {
        Page<SchoolResponse> schools = schoolService.getActiveSchools(pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách trường học thành công", schools));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")
    @Operation(summary = "Get school by ID")
    public ResponseEntity<ApiResponse<SchoolResponse>> getSchoolById(@PathVariable Long id) {
        SchoolResponse school = schoolService.getSchoolById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin trường học thành công", school));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")
    @Operation(summary = "Search schools by name")
    public ResponseEntity<ApiResponse<List<SchoolResponse>>> searchSchools(
            @RequestParam String name) {
        List<SchoolResponse> schools = schoolService.searchSchools(name);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm trường học thành công", schools));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new school", description = "Admin only")
    public ResponseEntity<ApiResponse<SchoolResponse>> createSchool(
            @Valid @RequestBody SchoolRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        
        com.englishlearn.domain.entity.User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SchoolResponse school = schoolService.createSchool(request);
        
        // Log action
        auditLogService.log(currentUser.getId(), "CREATE_SCHOOL", "Tạo trường học: " + school.getName(),
                servletRequest.getRemoteAddr(), servletRequest.getHeader("User-Agent"));
                
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo trường học thành công", school));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")
    @Operation(summary = "Update a school")
    public ResponseEntity<ApiResponse<SchoolResponse>> updateSchool(
            @PathVariable Long id,
            @Valid @RequestBody SchoolRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        
        com.englishlearn.domain.entity.User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Security check for SCHOOL role
        if (currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_SCHOOL"))) {
            if (currentUser.getSchool() == null || !currentUser.getSchool().getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Bạn chỉ có quyền cập nhật thông tin trường của mình", null));
            }
        }
        
        SchoolResponse school = schoolService.updateSchool(id, request);

        // Log action
        auditLogService.log(currentUser.getId(), "UPDATE_SCHOOL", "Cập nhật trường học: " + school.getName(),
                servletRequest.getRemoteAddr(), servletRequest.getHeader("User-Agent"));

        return ResponseEntity.ok(ApiResponse.success("Cập nhật trường học thành công", school));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft delete a school", description = "Admin only")
    public ResponseEntity<ApiResponse<Void>> deleteSchool(@PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        
        com.englishlearn.domain.entity.User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SchoolResponse targetSchool = schoolService.getSchoolById(id);
        schoolService.deleteSchool(id);

        // Log action
        auditLogService.log(currentUser.getId(), "DELETE_SCHOOL", "Xóa trường học: " + targetSchool.getName(),
                servletRequest.getRemoteAddr(), servletRequest.getHeader("User-Agent"));

        return ResponseEntity.ok(ApiResponse.success("Xóa trường học thành công", null));
    }

    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Permanently delete a school", description = "Admin only - Use with caution")
    public ResponseEntity<ApiResponse<Void>> hardDeleteSchool(@PathVariable Long id) {
        schoolService.hardDeleteSchool(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa vĩnh viễn trường học thành công", null));
    }
}
