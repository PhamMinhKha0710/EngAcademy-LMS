package com.englishlearn.infrastructure.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Primary cache manager for general caches.
     */
    @Bean
    @Primary
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(500)
            .expireAfterWrite(10, TimeUnit.MINUTES)
            .recordStats());
        return cacheManager;
    }

    /**
     * Separate cache manager for the learningPath cache with dedicated settings.
     * Smaller max size, same TTL.
     */
    @Bean
    public CacheManager learningPathCacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("learningPath");
        manager.registerCustomCache("learningPath",
            Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .recordStats()
                .build());
        return manager;
    }

    /**
     * Separate cache manager for leaderboard with larger capacity and longer TTL.
     */
    @Bean
    public CacheManager leaderboardCacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("leaderboard");
        manager.registerCustomCache("leaderboard",
            Caffeine.newBuilder()
                .maximumSize(10000)
                .expireAfterWrite(30, TimeUnit.MINUTES)
                .recordStats()
                .build());
        return manager;
    }
}
