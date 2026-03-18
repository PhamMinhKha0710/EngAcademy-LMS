package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.ClassRoomRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.ClassRoomResponse;
import com.englishlearn.application.dto.response.UserResponse;
import com.englishlearn.application.dto.response.ClassStudentResponse;
import com.englishlearn.application.service.ClassRoomService;
import com.englishlearn.application.service.UserService;
import com.englishlearn.application.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
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
        private final AuditLogService auditLogService;

        @GetMapping
        @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
        @Operation(summary = "Get all classrooms")
        public ResponseEntity<ApiResponse<List<ClassRoomResponse>>> getAllClassRooms(
                        @AuthenticationPrincipal UserDetails userDetails) {

                UserResponse currentUser = userService.getUserByUsername(userDetails.getUsername());
                if (currentUser.getRoles().contains("ROLE_SCHOOL")) {
                        if (currentUser.getSchoolId() == null) {
                                return ResponseEntity
                                                .ok(ApiResponse.success("Lấy danh sách lớp học thành công", List.of()));
                        }
                        // For school role, we should probably only return classes of their school.
                        // But ClassRoomService.getAllClassRooms doesn't take schoolId.
                        // Let's use getBySchool instead or add a method.
                        // Actually, we can just use the existing Service method if it exists or filter
                        // here.
                        List<ClassRoomResponse> classRooms = classRoomService
                                        .getClassRoomsBySchool(currentUser.getSchoolId());
                        return ResponseEntity.ok(
                                        ApiResponse.success("Lấy danh sách lớp học của trường thành công", classRooms));
                }

                List<ClassRoomResponse> classRooms = classRoomService.getAllClassRooms();
                return ResponseEntity.ok(ApiResponse.success("Lấy danh sách lớp học thành công", classRooms));
        }

        @GetMapping("/school/{schoolId}")
        @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
        @Operation(summary = "Get classrooms by school")
        public ResponseEntity<ApiResponse<Page<ClassRoomResponse>>> getClassRoomsBySchool(
                        @PathVariable Long schoolId, Pageable pageable,
                        @AuthenticationPrincipal UserDetails userDetails) {

                var currentUser = userService.getUserByUsername(userDetails.getUsername());
                if (currentUser.getRoles().contains("ROLE_SCHOOL")) {
                        if (currentUser.getSchoolId() == null || !currentUser.getSchoolId().equals(schoolId)) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                                .body(ApiResponse.error("Bạn không có quyền xem lớp của trường khác"));
                        }
                }

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
        public ResponseEntity<ApiResponse<ClassRoomResponse>> getClassRoomById(
                        @PathVariable Long id,
                        @AuthenticationPrincipal UserDetails userDetails) {

                UserResponse currentUser = userService.getUserByUsername(userDetails.getUsername());
                ClassRoomResponse classRoom = classRoomService.getClassRoomById(id);

                if (currentUser.getRoles().contains("ROLE_SCHOOL")) {
                        if (currentUser.getSchoolId() == null
                                        || !currentUser.getSchoolId().equals(classRoom.getSchoolId())) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                                .body(ApiResponse.error("Bạn không có quyền xem lớp của trường khác"));
                        }
                }

                return ResponseEntity.ok(ApiResponse.success("Lấy thông tin lớp học thành công", classRoom));
        }

        @PostMapping
        @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")
        @Operation(summary = "Create a new classroom")
        public ResponseEntity<ApiResponse<ClassRoomResponse>> createClassRoom(
                        @Valid @RequestBody ClassRoomRequest request,
                        @AuthenticationPrincipal UserDetails userDetails,
                        HttpServletRequest servletRequest) {

                var currentUser = userService.getUserByUsername(userDetails.getUsername());
                if (currentUser.getRoles().contains("ROLE_SCHOOL")) {
                        if (currentUser.getSchoolId() == null) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                                .body(ApiResponse.error("Tài khoản chưa được liên kết với trường học"));
                        }
                        // Force schoolId to own school
                        request.setSchoolId(currentUser.getSchoolId());
                }

                ClassRoomResponse classRoom = classRoomService.createClassRoom(request);
                
                auditLogService.log(currentUser.getId(), "CREATE_CLASSROOM", "Tạo lớp học: " + classRoom.getName(),
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
                        HttpServletRequest servletRequest) {

                var currentUser = userService.getUserByUsername(userDetails.getUsername());
                ClassRoomResponse existing = classRoomService.getClassRoomById(id);

                if (currentUser.getRoles().contains("ROLE_SCHOOL")) {
                        if (currentUser.getSchoolId() == null
                                        || !currentUser.getSchoolId().equals(existing.getSchoolId())) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                                .body(ApiResponse.error(
                                                                "Bạn không có quyền cập nhật lớp của trường khác"));
                        }
                        // Force schoolId to own school
                        request.setSchoolId(currentUser.getSchoolId());
                }

                ClassRoomResponse classRoom = classRoomService.updateClassRoom(id, request);
                
                auditLogService.log(currentUser.getId(), "UPDATE_CLASSROOM", "Cập nhật lớp học: " + classRoom.getName(),
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
                        HttpServletRequest servletRequest) {

                var currentUser = userService.getUserByUsername(userDetails.getUsername());
                ClassRoomResponse classRoom = null;
                if (currentUser.getRoles().contains("ROLE_SCHOOL")) {
                        classRoom = classRoomService.getClassRoomById(classId);
                        UserResponse teacher = userService.getUserById(teacherId);

                        if (currentUser.getSchoolId() == null
                                        || !currentUser.getSchoolId().equals(classRoom.getSchoolId())
                                        || !currentUser.getSchoolId().equals(teacher.getSchoolId())) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                                .body(ApiResponse.error(
                                                                "Bạn không có quyền thực hiện thao tác này trên trường khác"));
                        }
                } else {
                        classRoom = classRoomService.getClassRoomById(classId);
                }

                classRoomService.assignTeacher(classId, teacherId);
                
                auditLogService.log(currentUser.getId(), "ASSIGN_TEACHER", "Phân công giáo viên ID " + teacherId + " cho lớp " + classRoom.getName(),
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
                        HttpServletRequest servletRequest) {

                var currentUser = userService.getUserByUsername(userDetails.getUsername());
                ClassRoomResponse classRoom = null;
                if (currentUser.getRoles().contains("ROLE_SCHOOL") || currentUser.getRoles().contains("ROLE_TEACHER")) {
                        classRoom = classRoomService.getClassRoomById(classId);
                        UserResponse student = userService.getUserById(studentId);

                        if (currentUser.getSchoolId() == null
                                        || !currentUser.getSchoolId().equals(classRoom.getSchoolId())
                                        || !currentUser.getSchoolId().equals(student.getSchoolId())) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                                .body(ApiResponse.error(
                                                                "Bạn không có quyền thực hiện thao tác này trên trường khác"));
                        }
                } else {
                        classRoom = classRoomService.getClassRoomById(classId);
                }

                classRoomService.addStudentToClass(classId, studentId);
                
                auditLogService.log(currentUser.getId(), "ADD_STUDENT", "Thêm học sinh ID " + studentId + " vào lớp " + classRoom.getName(),
                        servletRequest.getRemoteAddr(), servletRequest.getHeader("User-Agent"));

                return ResponseEntity.ok(ApiResponse.success("Thêm học sinh vào lớp thành công", null));
        }

        @DeleteMapping("/{classId}/students/{studentId}")
        @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
        @Operation(summary = "Remove a student from classroom")
        public ResponseEntity<ApiResponse<Void>> removeStudentFromClass(
                        @PathVariable Long classId,
                        @PathVariable Long studentId,
                        @AuthenticationPrincipal UserDetails userDetails,
                        HttpServletRequest servletRequest) {

                var currentUser = userService.getUserByUsername(userDetails.getUsername());
                ClassRoomResponse classRoom = classRoomService.getClassRoomById(classId);
                if (currentUser.getRoles().contains("ROLE_SCHOOL") || currentUser.getRoles().contains("ROLE_TEACHER")) {
                        if (currentUser.getSchoolId() == null
                                        || !currentUser.getSchoolId().equals(classRoom.getSchoolId())) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                                .body(ApiResponse.error(
                                                                "Bạn không có quyền thực hiện thao tác này trên lớp của trường khác"));
                        }
                }

                classRoomService.removeStudentFromClass(classId, studentId);
                
                auditLogService.log(currentUser.getId(), "REMOVE_STUDENT", "Xóa học sinh ID " + studentId + " khỏi lớp " + classRoom.getName(),
                        servletRequest.getRemoteAddr(), servletRequest.getHeader("User-Agent"));

                return ResponseEntity.ok(ApiResponse.success("Xóa học sinh khỏi lớp thành công", null));
        }

        @GetMapping("/{classId}/students")
        @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
        @Operation(summary = "Get active students in classroom")
        public ResponseEntity<ApiResponse<List<ClassStudentResponse>>> getStudentsByClass(
                        @PathVariable Long classId,
                        @AuthenticationPrincipal UserDetails userDetails) {

                var currentUser = userService.getUserByUsername(userDetails.getUsername());
                if (currentUser.getRoles().contains("ROLE_SCHOOL") || currentUser.getRoles().contains("ROLE_TEACHER")) {
                        ClassRoomResponse classRoom = classRoomService.getClassRoomById(classId);
                        if (currentUser.getSchoolId() == null
                                        || !currentUser.getSchoolId().equals(classRoom.getSchoolId())) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                                .body(ApiResponse.error("Bạn không có quyền xem danh sách này"));
                        }
                }

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
        public ResponseEntity<ApiResponse<Void>> deleteClassRoom(
                        @PathVariable Long id,
                        @AuthenticationPrincipal UserDetails userDetails,
                        HttpServletRequest servletRequest) {

                var currentUser = userService.getUserByUsername(userDetails.getUsername());
                ClassRoomResponse existing = classRoomService.getClassRoomById(id);

                if (currentUser.getRoles().contains("ROLE_SCHOOL")) {
                        if (currentUser.getSchoolId() == null
                                        || !currentUser.getSchoolId().equals(existing.getSchoolId())) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                                .body(ApiResponse.error("Bạn không có quyền xóa lớp của trường khác"));
                        }
                }

                classRoomService.deleteClassRoom(id);
                
                auditLogService.log(currentUser.getId(), "DELETE_CLASSROOM", "Xóa lớp học: " + existing.getName(),
                        servletRequest.getRemoteAddr(), servletRequest.getHeader("User-Agent"));

                return ResponseEntity.ok(ApiResponse.success("Xóa lớp học thành công", null));
        }
}
