package com.englishlearn.security;

import com.englishlearn.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate Limiter cho endpoint đăng nhập và đăng ký.
 * Mặc định: 10 lần thử / IP / 60 giây.
 * Cấu hình qua application.properties:
 *   rate-limit.max-attempts=10
 *   rate-limit.window-seconds=60
 *   rate-limit.enabled=true
 */
@Slf4j
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    @Value("${rate-limit.max-attempts:10}")
    private int maxAttempts;

    @Value("${rate-limit.window-seconds:60}")
    private long windowSeconds;

    @Value("${rate-limit.enabled:true}")
    private boolean enabled;

    private final Map<String, RateLimitEntry> attempts = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();

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
