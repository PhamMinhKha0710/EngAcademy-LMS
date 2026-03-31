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
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService {

    private final StringRedisTemplate redisTemplate;

    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, refreshExpiration);
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
        boolean valid = (username.equals(userDetails.getUsername())) && !isTokenExpired(token);

        // Also check blacklist
        if (valid && isTokenBlacklisted(token)) {
            log.debug("Token is blacklisted for user: {}", username);
            return false;
        }

        return valid;
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
        try {
            String jti = extractJti(token);
            if (jti == null) {
                jti = "token:" + Integer.toHexString(token.hashCode());
            }
            return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + jti));
        } catch (Exception e) {
            log.warn("Redis unavailable for blacklist check, assuming not blacklisted: {}", e.getMessage());
            return false;
        }
    }

    public void blacklistToken(String token) {
        try {
            String jti = extractJti(token);
            if (jti == null) {
                jti = "token:" + Integer.toHexString(token.hashCode());
            }

            long ttlSeconds = getTokenExpirationRemainingSeconds(token);
            if (ttlSeconds > 0) {
                redisTemplate.opsForValue().set(BLACKLIST_PREFIX + jti, "1", ttlSeconds, TimeUnit.SECONDS);
                log.info("Token blacklisted with JTI: {}, TTL: {} seconds", jti, ttlSeconds);
            } else {
                log.debug("Token already expired, no need to blacklist: {}", jti);
            }
        } catch (Exception e) {
            log.warn("Redis unavailable for blacklist token, skip: {}", e.getMessage());
        }
    }

    private String extractJti(String token) {
        try {
            return extractClaim(token, claims -> claims.get("jti", String.class));
        } catch (Exception e) {
            // Token doesn't have JTI claim
            return null;
        }
    }
}
