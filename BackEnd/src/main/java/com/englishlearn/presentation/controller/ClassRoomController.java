package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.ClassRoomRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.ClassRoomResponse;
import com.englishlearn.application.dto.response.ClassStudentResponse;
import com.englishlearn.application.service.ClassRoomService;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
@Tag(name = "ClassRoom Management", description = "APIs for managing classrooms")
public class ClassRoomController {

    private final ClassRoomService classRoomService;
    private final UserService userService;
    private final com.englishlearn.application.service.AuditLogService auditLogService;
    private final com.englishlearn.infrastructure.persistence.UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
    @Operation(summary = "Get all classrooms")
    public ResponseEntity<ApiResponse<List<ClassRoomResponse>>> getAllClassRooms() {
        List<ClassRoomResponse> classRooms = classRoomService.getAllClassRooms();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách lớp học thành công", classRooms));
    }

    @GetMapping("/school/{schoolId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
    @Operation(summary = "Get classrooms by school")
    public ResponseEntity<ApiResponse<Page<ClassRoomResponse>>> getClassRoomsBySchool(
            @PathVariable Long schoolId, Pageable pageable) {
        Page<ClassRoomResponse> classRooms = classRoomService.getClassRoomsBySchool(schoolId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách lớp học thành công", classRooms));
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
    @Operation(summary = "Get classrooms by teacher")
    public ResponseEntity<ApiResponse<List<ClassRoomResponse>>> getClassRoomsByTeacher(
            @PathVariable Long teacherId) {
        List<ClassRoomResponse> classRooms = classRoomService.getClassRoomsByTeacher(teacherId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách lớp học thành công", classRooms));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get classrooms by student")
    public ResponseEntity<ApiResponse<List<ClassRoomResponse>>> getClassRoomsByStudent(
            @PathVariable Long studentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Student chỉ được xem lớp của chính mình
        var currentUser = userService.getUserByUsername(userDetails.getUsername());
        if (currentUser.getRoles() != null
                && currentUser.getRoles().contains("ROLE_STUDENT")
                && !currentUser.getId().equals(studentId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Bạn không có quyền xem lớp của học sinh khác"));
        }

        List<ClassRoomResponse> classRooms = classRoomService.getClassRoomsByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách lớp học thành công", classRooms));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get classroom by ID")
    public ResponseEntity<ApiResponse<ClassRoomResponse>> getClassRoomById(@PathVariable Long id) {
        ClassRoomResponse classRoom = classRoomService.getClassRoomById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin lớp học thành công", classRoom));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")
    @Operation(summary = "Create a new classroom")
    public ResponseEntity<ApiResponse<ClassRoomResponse>> createClassRoom(
            @Valid @RequestBody ClassRoomRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        
        com.englishlearn.domain.entity.User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ClassRoomResponse classRoom = classRoomService.createClassRoom(request);
        
        // Log action
        auditLogService.log(currentUser.getId(), "CREATE_CLASS", "Tạo lớp học: " + classRoom.getName(),
                servletRequest.getRemoteAddr(), servletRequest.getHeader("User-Agent"));
                
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo lớp học thành công", classRoom));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")
    @Operation(summary = "Update a classroom")
    public ResponseEntity<ApiResponse<ClassRoomResponse>> updateClassRoom(
            @PathVariable Long id,
            @Valid @RequestBody ClassRoomRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        
        com.englishlearn.domain.entity.User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        ClassRoomResponse classRoom = classRoomService.updateClassRoom(id, request);

        // Log action
        auditLogService.log(currentUser.getId(), "UPDATE_CLASS", "Cập nhật lớp học: " + classRoom.getName(),
                servletRequest.getRemoteAddr(), servletRequest.getHeader("User-Agent"));

        return ResponseEntity.ok(ApiResponse.success("Cập nhật lớp học thành công", classRoom));
    }

    @PostMapping("/{classId}/teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")
    @Operation(summary = "Assign a teacher to classroom")
    public ResponseEntity<ApiResponse<Void>> assignTeacher(
            @PathVariable Long classId,
            @PathVariable Long teacherId,
            @AuthenticationPrincipal UserDetails userDetails,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        
        com.englishlearn.domain.entity.User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        classRoomService.assignTeacher(classId, teacherId);
        ClassRoomResponse classRoom = classRoomService.getClassRoomById(classId);

        // Log action
        auditLogService.log(currentUser.getId(), "ASSIGN_TEACHER", "Phân công giáo viên cho lớp: " + classRoom.getName(),
                servletRequest.getRemoteAddr(), servletRequest.getHeader("User-Agent"));

        return ResponseEntity.ok(ApiResponse.success("Phân công giáo viên thành công", null));
    }

    @PostMapping("/{classId}/students/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
    @Operation(summary = "Add a student to classroom")
    public ResponseEntity<ApiResponse<Void>> addStudentToClass(
            @PathVariable Long classId,
            @PathVariable Long studentId,
            @AuthenticationPrincipal UserDetails userDetails,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        
        com.englishlearn.domain.entity.User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        classRoomService.addStudentToClass(classId, studentId);
        ClassRoomResponse classRoom = classRoomService.getClassRoomById(classId);

        // Log action
        auditLogService.log(currentUser.getId(), "ADD_STUDENT_TO_CLASS", "Thêm học sinh vào lớp: " + classRoom.getName(),
                servletRequest.getRemoteAddr(), servletRequest.getHeader("User-Agent"));

        return ResponseEntity.ok(ApiResponse.success("Thêm học sinh vào lớp thành công", null));
    }

    @DeleteMapping("/{classId}/students/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
    @Operation(summary = "Remove a student from classroom")
    public ResponseEntity<ApiResponse<Void>> removeStudentFromClass(
            @PathVariable Long classId,
            @PathVariable Long studentId) {
        classRoomService.removeStudentFromClass(classId, studentId);
        return ResponseEntity.ok(ApiResponse.success("Xóa học sinh khỏi lớp thành công", null));
    }

    @GetMapping("/{classId}/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
    @Operation(summary = "Get active students in classroom")
    public ResponseEntity<ApiResponse<List<ClassStudentResponse>>> getStudentsByClass(
            @PathVariable Long classId) {
        List<ClassStudentResponse> students = classRoomService.getStudentsByClass(classId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách học sinh trong lớp thành công", students));
    }

    @GetMapping("/{classId}/students/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
    @Operation(summary = "Search students by username/fullName/email to add into classroom")
    public ResponseEntity<ApiResponse<List<ClassStudentResponse>>> searchStudentsForClass(
            @PathVariable Long classId,
            @RequestParam String keyword) {
        List<ClassStudentResponse> students = classRoomService.searchStudentsForClass(classId, keyword);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm học sinh thành công", students));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")
    @Operation(summary = "Soft delete a classroom")
    public ResponseEntity<ApiResponse<Void>> deleteClassRoom(@PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        
        com.englishlearn.domain.entity.User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ClassRoomResponse targetClass = classRoomService.getClassRoomById(id);
        classRoomService.deleteClassRoom(id);

        // Log action
        auditLogService.log(currentUser.getId(), "DELETE_CLASS", "Xóa lớp học: " + targetClass.getName(),
                servletRequest.getRemoteAddr(), servletRequest.getHeader("User-Agent"));

        return ResponseEntity.ok(ApiResponse.success("Xóa lớp học thành công", null));
    }
}
