package com.englishlearn.application.service;

import com.englishlearn.application.dto.response.UserResponse;
import com.englishlearn.domain.entity.Role;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.exception.ApiException;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng với ID: " + id));
        return mapToResponse(user);
    }

    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng: " + username));
        return mapToResponse(user);
    }

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional
    public UserResponse updateProfile(Long userId, String fullName, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        if (fullName != null) {
            user.setFullName(fullName);
        }
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }

        User savedUser = userRepository.save(user);
        log.info("Updated profile for user: {}", userId);
        return mapToResponse(savedUser);
    }

    @Transactional
    public void addCoins(Long userId, Integer coins) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));
        user.setCoins((user.getCoins() != null ? user.getCoins() : 0) + coins);
        userRepository.save(user);
        log.info("Added {} coins to user {}", coins, userId);
    }

    @Transactional
    public void incrementStreak(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));
        user.setStreakDays((user.getStreakDays() != null ? user.getStreakDays() : 0) + 1);
        userRepository.save(user);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .coins(user.getCoins())
                .streakDays(user.getStreakDays())
                .isActive(user.getIsActive())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                .build();
    }
}
