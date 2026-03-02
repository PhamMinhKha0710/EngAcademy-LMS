package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.ClassRoomRequest;
import com.englishlearn.application.dto.response.ClassRoomResponse;
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
        return classRoomRepository.findBySchoolIdAndIsActiveTrue(schoolId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<ClassRoomResponse> getClassRoomsBySchool(Long schoolId) {
        return classRoomRepository.findBySchoolIdAndIsActiveTrue(schoolId, Pageable.unpaged())
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
    public ClassRoomResponse getClassRoomById(Long id) {
        ClassRoom classRoom = classRoomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", "id", id));
        return mapToResponse(classRoom);
    }

    @Transactional
    public ClassRoomResponse createClassRoom(ClassRoomRequest request) {
        School school = schoolRepository.findById(request.getSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("Trường học", "id", request.getSchoolId()));

        // Check duplicate name in same school
        if (classRoomRepository.existsByNameAndSchoolId(request.getName(), request.getSchoolId())) {
            throw new DuplicateResourceException("Lớp học", "tên", request.getName());
        }

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

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Học sinh", "id", studentId));

        StudentClass studentClass = studentClassRepository.findByStudentAndClassRoom(student, classRoom)
                .orElseThrow(() -> new ResourceNotFoundException("Học sinh", "lớp học", classRoom.getName()));

        studentClass.setStatus("REMOVED");
        studentClassRepository.save(studentClass);
        log.info("Removed student {} from class {}", student.getFullName(), classRoom.getName());
    }

    @Transactional
    public void deleteClassRoom(Long id) {
        ClassRoom classRoom = classRoomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", "id", id));

        classRoom.setIsActive(false);
        classRoomRepository.save(classRoom);
        log.info("Soft deleted class: {} (ID: {})", classRoom.getName(), classRoom.getId());
    }

    @Transactional(readOnly = true)
    public List<com.englishlearn.application.dto.response.UserResponse> getStudentsByClass(Long classId) {
        if (!classRoomRepository.existsById(classId)) {
            throw new ResourceNotFoundException("Lớp học", "id", classId);
        }

        return studentClassRepository.findActiveStudentsByClassId(classId).stream()
                .map(sc -> {
                    User s = sc.getStudent();
                    return com.englishlearn.application.dto.response.UserResponse.builder()
                            .id(s.getId())
                            .username(s.getUsername())
                            .email(s.getEmail())
                            .fullName(s.getFullName())
                            .roles(java.util.Collections.singletonList(com.englishlearn.domain.entity.Role.STUDENT))
                            .schoolId(s.getSchool() != null ? s.getSchool().getId() : null)
                            .schoolName(s.getSchool() != null ? s.getSchool().getName() : null)
                            .build();
                })
                .collect(Collectors.toList());
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
                .build();
    }
}
