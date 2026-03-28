package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.ClassRoomRequest;
import com.englishlearn.application.dto.response.ClassRoomResponse;
import com.englishlearn.application.dto.response.ClassStudentResponse;
import com.englishlearn.domain.entity.ClassRoom;
import com.englishlearn.domain.entity.School;
import com.englishlearn.domain.entity.StudentClass;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.exception.DuplicateResourceException;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.ClassRoomRepository;
import com.englishlearn.infrastructure.persistence.SchoolRepository;
import com.englishlearn.infrastructure.persistence.StudentClassRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClassRoomService {

    private final ClassRoomRepository classRoomRepository;
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final StudentClassRepository studentClassRepository;

    @Transactional(readOnly = true)
    public List<ClassRoomResponse> getAllClassRooms() {
        return classRoomRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ClassRoomResponse> getClassRoomsBySchool(Long schoolId, Pageable pageable) {
        return classRoomRepository.findBySchoolId(schoolId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<ClassRoomResponse> getClassRoomsBySchool(Long schoolId) {
        return classRoomRepository.findBySchoolId(schoolId, Pageable.unpaged())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClassRoomResponse> getClassRoomsByTeacher(Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Giáo viên", "id", teacherId));

        return classRoomRepository.findByTeacher(teacher).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClassRoomResponse> getClassRoomsByStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Học sinh", "id", studentId));

        return studentClassRepository.findByStudent(student).stream()
                .filter(sc -> "ACTIVE".equalsIgnoreCase(sc.getStatus()))
                .map(StudentClass::getClassRoom)
                .filter(classRoom -> Boolean.TRUE.equals(classRoom.getIsActive()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClassRoomResponse getClassRoomById(Long id) {
        ClassRoom classRoom = classRoomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", "id", id));
        return mapToResponse(classRoom);
    }

    @Transactional
    public ClassRoomResponse createClassRoom(ClassRoomRequest request) {
        if (request.getSchoolId() == null) {
            throw com.englishlearn.domain.exception.ApiException.badRequest("Trường học không được để trống");
        }
        
        School school = schoolRepository.findById(request.getSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("Trường học", "id", request.getSchoolId()));

        // Check duplicate name in same school
        // if (classRoomRepository.existsByNameAndSchoolId(request.getName(), request.getSchoolId())) {
        //     throw new DuplicateResourceException("Lớp học", "tên", request.getName());
        // }

        User teacher = null;
        if (request.getTeacherId() != null) {
            teacher = userRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Giáo viên", "id", request.getTeacherId()));
        }

        ClassRoom classRoom = ClassRoom.builder()
                .name(request.getName())
                .school(school)
                .teacher(teacher)
                .academicYear(request.getAcademicYear())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        ClassRoom savedClassRoom = classRoomRepository.save(classRoom);
        log.info("Created new class: {} in school {} (ID: {})",
                savedClassRoom.getName(), school.getName(), savedClassRoom.getId());

        return mapToResponse(savedClassRoom);
    }

    @Transactional
    public ClassRoomResponse updateClassRoom(Long id, ClassRoomRequest request) {
        ClassRoom classRoom = classRoomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", "id", id));

        // Check duplicate name if changed
        if (!classRoom.getName().equals(request.getName())) {
            if (classRoomRepository.existsByNameAndSchoolId(request.getName(), classRoom.getSchool().getId())) {
                throw new DuplicateResourceException("Lớp học", "tên", request.getName());
            }
        }

        User teacher = null;
        if (request.getTeacherId() != null) {
            teacher = userRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Giáo viên", "id", request.getTeacherId()));
        }

        classRoom.setName(request.getName());
        classRoom.setTeacher(teacher);
        classRoom.setAcademicYear(request.getAcademicYear());

        if (request.getIsActive() != null) {
            classRoom.setIsActive(request.getIsActive());
        }

        ClassRoom updatedClassRoom = classRoomRepository.save(classRoom);
        log.info("Updated class: {} (ID: {})", updatedClassRoom.getName(), updatedClassRoom.getId());

        return mapToResponse(updatedClassRoom);
    }

    @Transactional
    public void assignTeacher(Long classId, Long teacherId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", "id", classId));

        validateClassRoomActive(classRoom);

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Giáo viên", "id", teacherId));

        classRoom.setTeacher(teacher);
        classRoomRepository.save(classRoom);
        log.info("Assigned teacher {} to class {}", teacher.getFullName(), classRoom.getName());
    }

    @Transactional
    public void addStudentToClass(Long classId, Long studentId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", "id", classId));

        validateClassRoomActive(classRoom);

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Học sinh", "id", studentId));

        // Check if already in class
        if (studentClassRepository.existsByStudentAndClassRoom(student, classRoom)) {
            throw new DuplicateResourceException("Học sinh", "lớp học", classRoom.getName());
        }

        StudentClass studentClass = StudentClass.builder()
                .student(student)
                .classRoom(classRoom)
                .status("ACTIVE")
                .build();

        studentClassRepository.save(studentClass);
        log.info("Added student {} to class {}", student.getFullName(), classRoom.getName());
    }

    @Transactional
    public void removeStudentFromClass(Long classId, Long studentId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", "id", classId));

        validateClassRoomActive(classRoom);

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Học sinh", "id", studentId));

        StudentClass studentClass = studentClassRepository.findByStudentAndClassRoom(student, classRoom)
                .orElseThrow(() -> new ResourceNotFoundException("Học sinh", "lớp học", classRoom.getName()));

        studentClass.setStatus("REMOVED");
        studentClassRepository.save(studentClass);
        log.info("Removed student {} from class {}", student.getFullName(), classRoom.getName());
    }

    @Transactional(readOnly = true)
    public List<ClassStudentResponse> getStudentsByClass(Long classId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", "id", classId));

        return studentClassRepository.findActiveStudentsByClassId(classRoom.getId()).stream()
                .map(sc -> ClassStudentResponse.builder()
                        .id(sc.getStudent().getId())
                        .username(sc.getStudent().getUsername())
                        .fullName(sc.getStudent().getFullName())
                        .email(sc.getStudent().getEmail())
                        .avatarUrl(sc.getStudent().getAvatarUrl())
                        .status(sc.getStatus())
                        .joinedAt(sc.getJoinedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClassStudentResponse> searchStudentsForClass(Long classId, String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }

        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", "id", classId));

        Set<Long> activeStudentIds = studentClassRepository.findActiveStudentsByClassId(classRoom.getId()).stream()
                .map(sc -> sc.getStudent().getId())
                .collect(Collectors.toSet());

        Long classSchoolId = classRoom.getSchool().getId();
        return userRepository.searchStudentsByKeyword(keyword.trim()).stream()
                .filter(student -> student.getSchool() != null
                        && student.getSchool().getId().equals(classSchoolId))
                .filter(student -> !activeStudentIds.contains(student.getId()))
                .limit(10)
                .map(student -> ClassStudentResponse.builder()
                        .id(student.getId())
                        .username(student.getUsername())
                        .fullName(student.getFullName())
                        .email(student.getEmail())
                        .avatarUrl(student.getAvatarUrl())
                        .status("AVAILABLE")
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteClassRoom(Long id) {
        ClassRoom classRoom = classRoomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", "id", id));

        classRoom.setIsActive(false);
        classRoomRepository.save(classRoom);
        log.info("Soft deleted class: {} (ID: {})", classRoom.getName(), classRoom.getId());
    }

    private void validateClassRoomActive(ClassRoom classRoom) {
        if (classRoom.getSchool() != null && !Boolean.TRUE.equals(classRoom.getSchool().getIsActive())) {
            throw new RuntimeException("Trường học của lớp này đã ngừng hoạt động. Không thể thực hiện thao tác.");
        }
        if (!Boolean.TRUE.equals(classRoom.getIsActive())) {
            throw new RuntimeException("Lớp học đã bị khóa hoặc ngừng hoạt động. Không thể thực hiện thao tác.");
        }
    }

    private ClassRoomResponse mapToResponse(ClassRoom classRoom) {
        Long studentCount = classRoomRepository.countStudentsByClassId(classRoom.getId());

        return ClassRoomResponse.builder()
                .id(classRoom.getId())
                .name(classRoom.getName())
                .academicYear(classRoom.getAcademicYear())
                .isActive(classRoom.getIsActive())
                .schoolId(classRoom.getSchool().getId())
                .schoolName(classRoom.getSchool().getName())
                .teacherId(classRoom.getTeacher() != null ? classRoom.getTeacher().getId() : null)
                .teacherName(classRoom.getTeacher() != null ? classRoom.getTeacher().getFullName() : null)
                .studentCount(studentCount != null ? studentCount : 0L)
                .createdAt(classRoom.getCreatedAt())
                .build();
    }
}
