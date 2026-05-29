package com.englishlearn.application.security;

import com.englishlearn.domain.entity.Role;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Set;

/**
 * Prevents privilege escalation via role assignment or impersonation of other teachers.
 */
@Component
@RequiredArgsConstructor
public class RoleAuthorizationGuard {

    private static final Set<String> SCHOOL_ASSIGNABLE = Set.of(Role.TEACHER, Role.STUDENT);

    private final UserRepository userRepository;

    public void assertCallerCanAssignRoles(Long callerId, Collection<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            return;
        }
        User caller = loadUser(callerId);
        if (isAdmin(caller)) {
            return;
        }
        if (isSchool(caller)) {
            for (String role : roleNames) {
                if (!SCHOOL_ASSIGNABLE.contains(role)) {
                    throw new AccessDeniedException("Trường học không được gán vai trò: " + role);
                }
            }
            return;
        }
        throw new AccessDeniedException("Bạn không có quyền gán vai trò người dùng");
    }

    public void assertCallerCanModifyUserFields(Long callerId, boolean changingRoles, boolean changingCoins) {
        User caller = loadUser(callerId);
        if (isAdmin(caller)) {
            return;
        }
        if (isSchool(caller)) {
            if (changingRoles) {
                // allowed only through assertCallerCanAssignRoles on the role list
            }
            if (changingCoins) {
                throw new AccessDeniedException("Chỉ quản trị hệ thống mới được chỉnh xu trực tiếp");
            }
            return;
        }
        if (changingRoles || changingCoins) {
            throw new AccessDeniedException("Bạn không có quyền thay đổi vai trò hoặc xu");
        }
    }

    public void assertTeacherIdMatchesCaller(Long callerId, Long teacherId) {
        User caller = loadUser(callerId);
        if (isAdmin(caller) || isSchool(caller)) {
            return;
        }
        if (isTeacher(caller) && !caller.getId().equals(teacherId)) {
            throw new AccessDeniedException("Giáo viên chỉ được thao tác với tài khoản giáo viên của mình");
        }
    }

    public void assertTeacherCanViewTeacherData(Long callerId, Long targetTeacherId) {
        User caller = loadUser(callerId);
        if (isAdmin(caller)) {
            return;
        }
        if (isSchool(caller)) {
            User target = loadUser(targetTeacherId);
            Long callerSchool = schoolId(caller);
            Long targetSchool = schoolId(target);
            if (callerSchool == null || targetSchool == null || !callerSchool.equals(targetSchool)) {
                throw new AccessDeniedException("Không thể xem dữ liệu giáo viên trường khác");
            }
            return;
        }
        if (isTeacher(caller) && !caller.getId().equals(targetTeacherId)) {
            throw new AccessDeniedException("Giáo viên không được xem dữ liệu giáo viên khác");
        }
    }

    private User loadUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", id));
    }

    private Long schoolId(User user) {
        return user.getSchool() != null ? user.getSchool().getId() : null;
    }

    private boolean isAdmin(User user) {
        return hasRole(user, Role.ADMIN);
    }

    private boolean isSchool(User user) {
        return hasRole(user, Role.SCHOOL);
    }

    private boolean isTeacher(User user) {
        return hasRole(user, Role.TEACHER);
    }

    private boolean hasRole(User user, String roleName) {
        return user.getRoles().stream().anyMatch(r -> roleName.equals(r.getName()));
    }
}
