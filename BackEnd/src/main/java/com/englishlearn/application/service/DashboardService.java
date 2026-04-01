package com.englishlearn.application.service;

import com.englishlearn.application.dto.response.DashboardStatsResponse;
import com.englishlearn.domain.entity.Role;
import com.englishlearn.infrastructure.persistence.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final ExamResultRepository examResultRepository;
    private final ClassRoomRepository classRoomRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getAdminDashboardStats() {
        return new DashboardStatsResponse(
                userRepository.count(),
                userRepository.countActiveUsers(),
                userRepository.countByRoleName(Role.TEACHER),
                userRepository.countByRoleName(Role.STUDENT),
                schoolRepository.count(),
                schoolRepository.countByIsActiveTrue(),
                examRepository.count(),
                questionRepository.count(),
                classRoomRepository.count(),
                examResultRepository.countBySubmittedAtIsNotNull(),
                examResultRepository.averageScoreAll() != null ? examResultRepository.averageScoreAll() : 0.0);
    }
}
