package com.englishlearn.application.security;

import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

/**
 * Enforces multi-school tenant boundaries for cross-user operations (BUG-BLOCKER-003).
 */
@Component
@RequiredArgsConstructor
public class SchoolTenantGuard {

    private final UserRepository userRepository;

    public void assertCanAccessUser(Long callerId, Long targetUserId) {
        User caller = userRepository.findById(callerId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", callerId));
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", targetUserId));
        assertCanAccessUser(caller, target);
    }

    public void assertCanAccessUser(User caller, User target) {
        if (isAdmin(caller)) {
            return;
        }
        Long callerSchoolId = caller.getSchool() != null ? caller.getSchool().getId() : null;
        Long targetSchoolId = target.getSchool() != null ? target.getSchool().getId() : null;
        if (callerSchoolId == null || targetSchoolId == null || !callerSchoolId.equals(targetSchoolId)) {
            throw new AccessDeniedException("Không thể truy cập dữ liệu người dùng thuộc trường khác");
        }
    }

    public void assertTeacherBelongsToSchool(Long teacherId, Long schoolId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Giáo viên", "id", teacherId));
        if (isAdmin(teacher)) {
            return;
        }
        Long teacherSchoolId = teacher.getSchool() != null ? teacher.getSchool().getId() : null;
        if (schoolId == null || teacherSchoolId == null || !schoolId.equals(teacherSchoolId)) {
            throw new AccessDeniedException("Giáo viên không thuộc trường của lớp học này");
        }
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(role -> "ROLE_ADMIN".equals(role.getName()));
    }
}
