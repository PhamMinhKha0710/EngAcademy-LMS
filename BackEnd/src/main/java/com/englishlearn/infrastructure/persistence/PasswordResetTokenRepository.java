package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.PasswordResetToken;
import com.englishlearn.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByOtpAndUsedFalse(String otp);

    void deleteAllByUser(User user);
}
