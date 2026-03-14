package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.AuditLog;
import com.englishlearn.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    List<AuditLog> findTop10ByUserOrderByCreatedAtDesc(User user);
}
