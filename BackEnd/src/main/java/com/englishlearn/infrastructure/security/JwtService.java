package com.englishlearn.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService {

    public static final String CLAIM_JTI = "jti";
    public static final String CLAIM_TOKEN_TYPE = "typ";
    public static final String TOKEN_TYPE_ACCESS = "access";
    public static final String TOKEN_TYPE_REFRESH = "refresh";

    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";
    private static final String REFRESH_ACTIVE_PREFIX = "jwt:refresh:active:";

    private final StringRedisTemplate redisTemplate;
    private final Map<String, String> fallbackActiveRefreshJti = new ConcurrentHashMap<>();

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get(CLAIM_TOKEN_TYPE, String.class));
    }

    public String extractJti(String token) {
        return extractClaim(token, claims -> claims.get(CLAIM_JTI, String.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>(extraClaims);
        claims.putIfAbsent(CLAIM_JTI, UUID.randomUUID().toString());
        claims.put(CLAIM_TOKEN_TYPE, TOKEN_TYPE_ACCESS);
        return buildToken(claims, userDetails, jwtExpiration);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        String jti = UUID.randomUUID().toString();
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_JTI, jti);
        claims.put(CLAIM_TOKEN_TYPE, TOKEN_TYPE_REFRESH);
        String token = buildToken(claims, userDetails, refreshExpiration);
        storeActiveRefreshJti(userDetails.getUsername(), jti);
        return token;
    }

    /**
     * Rotate refresh token: blacklist the presented jti and issue a new refresh token.
     */
    public String rotateRefreshToken(UserDetails userDetails, String presentedRefreshToken) {
        String jti = extractJti(presentedRefreshToken);
        if (jti == null || jti.isBlank()) {
            throw new IllegalArgumentException("Refresh token missing jti");
        }
        blacklistJti(jti, refreshExpiration / 1000);
        return generateRefreshToken(userDetails);
    }

    public void revokeRefreshTokensForUser(String username) {
        String activeJti = getActiveRefreshJti(username);
        if (activeJti != null) {
            blacklistJti(activeJti, refreshExpiration / 1000);
        }
        deleteActiveRefreshJti(username);
    }

    public boolean isRefreshTokenActive(String username, String refreshToken) {
        String jti = extractJti(refreshToken);
        if (jti == null || jti.isBlank()) {
            return false;
        }
        if (isJtiBlacklisted(jti)) {
            return false;
        }
        String active = getActiveRefreshJti(username);
        return jti.equals(active);
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        boolean valid = username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        if (valid && isTokenBlacklisted(token)) {
            log.debug("Token is blacklisted for user: {}", username);
            return false;
        }
        return valid;
    }

    public boolean isRefreshTokenValid(String refreshToken, UserDetails userDetails) {
        if (!TOKEN_TYPE_REFRESH.equals(extractTokenType(refreshToken))) {
            return false;
        }
        return isTokenValid(refreshToken, userDetails) && isRefreshTokenActive(userDetails.getUsername(), refreshToken);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public long getTokenExpirationRemainingSeconds(String token) {
        Date expiration = extractExpiration(token);
        long remainingMs = expiration.getTime() - System.currentTimeMillis();
        return Math.max(0, remainingMs / 1000);
    }

    public boolean isTokenBlacklisted(String token) {
        String jti = extractJti(token);
        if (jti == null || jti.isBlank()) {
            jti = "token:" + Integer.toHexString(token.hashCode());
        }
        return isJtiBlacklisted(jti);
    }

    public void blacklistToken(String token) {
        String jti = extractJti(token);
        if (jti == null || jti.isBlank()) {
            jti = "token:" + Integer.toHexString(token.hashCode());
        }
        long ttlSeconds = getTokenExpirationRemainingSeconds(token);
        if (ttlSeconds > 0) {
            blacklistJti(jti, ttlSeconds);
        }
    }

    private void blacklistJti(String jti, long ttlSeconds) {
        if (ttlSeconds <= 0) {
            return;
        }
        try {
            redisTemplate.opsForValue().set(BLACKLIST_PREFIX + jti, "1", ttlSeconds, TimeUnit.SECONDS);
            log.debug("JTI blacklisted: {}, TTL: {}s", jti, ttlSeconds);
        } catch (Exception e) {
            log.warn("Redis unavailable for blacklist jti, refresh rotation may be weaker: {}", e.getMessage());
        }
    }

    private boolean isJtiBlacklisted(String jti) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + jti));
        } catch (Exception e) {
            log.warn("Redis unavailable for blacklist check: {}", e.getMessage());
            return false;
        }
    }

    private void storeActiveRefreshJti(String username, String jti) {
        long ttlSeconds = refreshExpiration / 1000;
        try {
            redisTemplate.opsForValue().set(REFRESH_ACTIVE_PREFIX + username, jti, ttlSeconds, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.warn("Redis unavailable, storing refresh jti in memory for user {}", username);
            fallbackActiveRefreshJti.put(username, jti);
        }
    }

    private String getActiveRefreshJti(String username) {
        try {
            return redisTemplate.opsForValue().get(REFRESH_ACTIVE_PREFIX + username);
        } catch (Exception e) {
            return fallbackActiveRefreshJti.get(username);
        }
    }

    private void deleteActiveRefreshJti(String username) {
        try {
            redisTemplate.delete(REFRESH_ACTIVE_PREFIX + username);
        } catch (Exception e) {
            log.warn("Redis unavailable when revoking refresh for {}", username);
        }
        fallbackActiveRefreshJti.remove(username);
    }
}
