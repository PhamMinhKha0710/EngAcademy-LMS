package com.englishlearn.infrastructure.security;

import com.englishlearn.application.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate Limiter cho endpoint đăng nhập và đăng ký.
 * Mặc định: 10 lần thử / IP / 60 giây.
 * Cấu hình qua application.properties:
 * rate-limit.max-attempts=10
 * rate-limit.window-seconds=60
 * rate-limit.enabled=true
 */
@Slf4j
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    @Value("${rate-limit.max-attempts:10}")
    private int maxAttempts;

    @Value("${rate-limit.window-seconds:60}")
    private long windowSeconds;

    @Value("${rate-limit.otp.max-attempts:5}")
    private int otpMaxAttempts;

    @Value("${rate-limit.otp.window-seconds:300}")
    private long otpWindowSeconds;

    @Value("${rate-limit.enabled:true}")
    private boolean enabled;

    private final Map<String, RateLimitEntry> attempts = new ConcurrentHashMap<>();
    private final Map<String, RateLimitEntry> otpAttempts = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private ScheduledExecutorService cleanupExecutor;

    @PostConstruct
    public void init() {
        cleanupExecutor = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "rate-limit-cleanup");
            t.setDaemon(true);
            return t;
        });
        // Run cleanup every 1 hour to remove stale entries
        cleanupExecutor.scheduleAtFixedRate(() -> {
            long cutoff = System.currentTimeMillis() - (windowSeconds * 2000L);
            int before = attempts.size();
            attempts.entrySet().removeIf(e -> e.getValue().windowStart < cutoff);
            int removed = before - attempts.size();
            if (removed > 0) {
                log.debug("Rate limit cleanup removed {} stale entries (current: {})", removed, attempts.size());
            }
        }, 1, 1, TimeUnit.HOURS);
    }

    @PreDestroy
    public void shutdown() {
        if (cleanupExecutor != null) {
            cleanupExecutor.shutdown();
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Skip OPTIONS (CORS preflight) requests before rate limiting check
        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Chỉ áp dụng rate limit cho POST /api/v1/auth/login và /api/v1/auth/register
        if (enabled && "POST".equalsIgnoreCase(method) &&
                (path.equals("/api/v1/auth/login") || path.equals("/api/v1/auth/register"))) {

            String clientIp = getClientIp(request);
            String key = clientIp + ":" + path;
            long windowMs = windowSeconds * 1000;

            RateLimitEntry entry = attempts.compute(key, (k, existing) -> {
                long now = System.currentTimeMillis();
                if (existing == null || now - existing.windowStart > windowMs) {
                    return new RateLimitEntry(now, new AtomicInteger(1));
                }
                existing.count.incrementAndGet();
                return existing;
            });

            if (entry.count.get() > maxAttempts) {
                log.warn("Rate limit vượt quá cho IP: {} trên {}", clientIp, path);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");

                ApiResponse<Void> apiResponse = ApiResponse.error(
                        "Quá nhiều yêu cầu. Vui lòng thử lại sau " + windowSeconds + " giây");
                objectMapper.writeValue(response.getOutputStream(), apiResponse);
                return;
            }
        }

        // Rate limit cho OTP verify endpoint (reset-password)
        if (enabled && "POST".equalsIgnoreCase(method) && path.equals("/api/v1/auth/reset-password")) {
            String clientIp = getClientIp(request);
            String key = clientIp + ":" + path;
            long windowMs = otpWindowSeconds * 1000;

            RateLimitEntry entry = otpAttempts.compute(key, (k, existing) -> {
                long now = System.currentTimeMillis();
                if (existing == null || now - existing.windowStart > windowMs) {
                    return new RateLimitEntry(now, new AtomicInteger(1));
                }
                existing.count.incrementAndGet();
                return existing;
            });

            if (entry.count.get() > otpMaxAttempts) {
                log.warn("OTP rate limit vượt quá cho IP: {} trên {}", clientIp, path);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");

                ApiResponse<Void> apiResponse = ApiResponse.error(
                        "Quá nhiều lần thử OTP. Vui lòng thử lại sau " + (otpWindowSeconds / 60) + " phút");
                objectMapper.writeValue(response.getOutputStream(), apiResponse);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    private static class RateLimitEntry {
        final long windowStart;
        final AtomicInteger count;

        RateLimitEntry(long windowStart, AtomicInteger count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}
