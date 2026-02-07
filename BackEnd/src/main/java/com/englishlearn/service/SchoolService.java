package com.englishlearn.service;

import com.englishlearn.dto.request.SchoolRequest;
import com.englishlearn.dto.response.SchoolResponse;
import com.englishlearn.entity.School;
import com.englishlearn.exception.DuplicateResourceException;
import com.englishlearn.exception.ResourceNotFoundException;
import com.englishlearn.repository.SchoolRepository;
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
public class SchoolService {

    private final SchoolRepository schoolRepository;

    @Transactional(readOnly = true)
    public List<SchoolResponse> getAllSchools() {
        return schoolRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<SchoolResponse> getActiveSchools(Pageable pageable) {
        return schoolRepository.findByIsActiveTrue(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public SchoolResponse getSchoolById(Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trường học", "id", id));
        return mapToResponse(school);
    }

    @Transactional(readOnly = true)
    public List<SchoolResponse> searchSchools(String name) {
        return schoolRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SchoolResponse createSchool(SchoolRequest request) {
        // Check duplicate email
        if (request.getEmail() != null && schoolRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Trường học", "email", request.getEmail());
        }

        School school = School.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .email(request.getEmail())
                .trialEndDate(request.getTrialEndDate())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        School savedSchool = schoolRepository.save(school);
        log.info("Created new school: {} (ID: {})", savedSchool.getName(), savedSchool.getId());

        return mapToResponse(savedSchool);
    }

    @Transactional
    public SchoolResponse updateSchool(Long id, SchoolRequest request) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trường học", "id", id));

        // Check duplicate email (excluding current school)
        if (request.getEmail() != null && !request.getEmail().equals(school.getEmail())) {
            if (schoolRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Trường học", "email", request.getEmail());
            }
        }

        school.setName(request.getName());
        school.setAddress(request.getAddress());
        school.setPhone(request.getPhone());
        school.setEmail(request.getEmail());
        school.setTrialEndDate(request.getTrialEndDate());

        if (request.getIsActive() != null) {
            school.setIsActive(request.getIsActive());
        }

        School updatedSchool = schoolRepository.save(school);
        log.info("Updated school: {} (ID: {})", updatedSchool.getName(), updatedSchool.getId());

        return mapToResponse(updatedSchool);
    }

    @Transactional
    public void deleteSchool(Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trường học", "id", id));

        // Soft delete
        school.setIsActive(false);
        schoolRepository.save(school);
        log.info("Soft deleted school: {} (ID: {})", school.getName(), school.getId());
    }

    @Transactional
    public void hardDeleteSchool(Long id) {
        if (!schoolRepository.existsById(id)) {
            throw new ResourceNotFoundException("Trường học", "id", id);
        }
        schoolRepository.deleteById(id);
        log.info("Hard deleted school with ID: {}", id);
    }

    private SchoolResponse mapToResponse(School school) {
        Long teacherCount = schoolRepository.countTeachersBySchoolId(school.getId());
        Long studentCount = schoolRepository.countStudentsBySchoolId(school.getId());
        Long classCount = schoolRepository.countClassesBySchoolId(school.getId());

        return SchoolResponse.builder()
                .id(school.getId())
                .name(school.getName())
                .address(school.getAddress())
                .phone(school.getPhone())
                .email(school.getEmail())
                .isActive(school.getIsActive())
                .trialEndDate(school.getTrialEndDate())
                .createdAt(school.getCreatedAt())
                .teacherCount(teacherCount != null ? teacherCount : 0L)
                .studentCount(studentCount != null ? studentCount : 0L)
                .classCount(classCount != null ? classCount : 0L)
                .build();
    }
}
