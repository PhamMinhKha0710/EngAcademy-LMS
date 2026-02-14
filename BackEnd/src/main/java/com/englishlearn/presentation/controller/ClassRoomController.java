package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.ClassRoomRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.ClassRoomResponse;
import com.englishlearn.application.service.ClassRoomService;
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
    private final com.englishlearn.application.service.UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
    @Operation(summary = "Get all classrooms")
    public ResponseEntity<ApiResponse<List<ClassRoomResponse>>> getAllClassRooms(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // If user is SCHOOL, filter by school
        if (userDetails != null && userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SCHOOL"))) {
             com.englishlearn.application.dto.response.UserResponse currentUser = userService.getUserByUsername(userDetails.getUsername());
             if (currentUser.getSchoolId() != null) {
                 return ResponseEntity.ok(ApiResponse.success("Lấy danh sách lớp học thành công", classRoomService.getClassRoomsBySchool(currentUser.getSchoolId())));
             }
        }
        
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
            @Valid @RequestBody ClassRoomRequest request) {
        ClassRoomResponse classRoom = classRoomService.createClassRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo lớp học thành công", classRoom));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")
    @Operation(summary = "Update a classroom")
    public ResponseEntity<ApiResponse<ClassRoomResponse>> updateClassRoom(
            @PathVariable Long id,
            @Valid @RequestBody ClassRoomRequest request) {
        ClassRoomResponse classRoom = classRoomService.updateClassRoom(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật lớp học thành công", classRoom));
    }

    @PostMapping("/{classId}/teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")
    @Operation(summary = "Assign a teacher to classroom")
    public ResponseEntity<ApiResponse<Void>> assignTeacher(
            @PathVariable Long classId,
            @PathVariable Long teacherId) {
        classRoomService.assignTeacher(classId, teacherId);
        return ResponseEntity.ok(ApiResponse.success("Phân công giáo viên thành công", null));
    }

    @PostMapping("/{classId}/students/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
    @Operation(summary = "Add a student to classroom")
    public ResponseEntity<ApiResponse<Void>> addStudentToClass(
            @PathVariable Long classId,
            @PathVariable Long studentId) {
        classRoomService.addStudentToClass(classId, studentId);
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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")
    @Operation(summary = "Soft delete a classroom")
    public ResponseEntity<ApiResponse<Void>> deleteClassRoom(@PathVariable Long id) {
        classRoomService.deleteClassRoom(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa lớp học thành công", null));
    }
}
