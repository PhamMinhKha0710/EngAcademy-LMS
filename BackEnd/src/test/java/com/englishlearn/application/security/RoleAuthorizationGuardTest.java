package com.englishlearn.application.security;

import com.englishlearn.domain.entity.Role;
import com.englishlearn.domain.entity.School;
import com.englishlearn.domain.entity.User;
import com.englishlearn.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoleAuthorizationGuardTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RoleAuthorizationGuard guard;

    private User admin;
    private User school;
    private User teacher;
    private User teacherOther;

    @BeforeEach
    void setUp() {
        School schoolA = School.builder().id(1L).name("A").build();
        School schoolB = School.builder().id(2L).name("B").build();

        admin = user(1L, Role.ADMIN, null);
        school = user(2L, Role.SCHOOL, schoolA);
        teacher = user(3L, Role.TEACHER, schoolA);
        teacherOther = user(4L, Role.TEACHER, schoolB);
    }

    @Test
    void schoolCannotAssignAdminRole() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(school));
        assertThrows(AccessDeniedException.class,
                () -> guard.assertCallerCanAssignRoles(2L, List.of(Role.ADMIN)));
    }

    @Test
    void schoolCanAssignTeacherRole() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(school));
        assertDoesNotThrow(() -> guard.assertCallerCanAssignRoles(2L, List.of(Role.TEACHER)));
    }

    @Test
    void schoolCannotModifyCoins() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(school));
        assertThrows(AccessDeniedException.class,
                () -> guard.assertCallerCanModifyUserFields(2L, false, true));
    }

    @Test
    void teacherCannotImpersonateAnotherTeacher() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(teacher));
        assertThrows(AccessDeniedException.class,
                () -> guard.assertTeacherIdMatchesCaller(3L, 4L));
    }

    @Test
    void teacherCannotViewOtherTeacherExams() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(teacher));
        assertThrows(AccessDeniedException.class,
                () -> guard.assertTeacherCanViewTeacherData(3L, teacherOther.getId()));
    }

    private static User user(Long id, String roleName, School school) {
        Role role = Role.builder().name(roleName).build();
        return User.builder()
                .id(id)
                .username("u" + id)
                .roles(Set.of(role))
                .school(school)
                .build();
    }
}
