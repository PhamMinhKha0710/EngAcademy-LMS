package com.englishlearn.infrastructure.config;

import io.lettuce.core.ClientOptions;
import io.lettuce.core.SocketOptions;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettucePoolingClientConfiguration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.url:}")
    private String redisUrl;

    @Lazy
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        // Parse REDIS_URL env var
        // Format: rediss://default:PASSWORD@host:port
        String host = "localhost";
        int port = 6379;
        String username = "default";
        String password = "";
        boolean useSsl = false;

        if (redisUrl != null && !redisUrl.isBlank()) {
            useSsl = redisUrl.startsWith("rediss://");
            String withoutScheme = redisUrl.replaceFirst("^(rediss|redis)://", "");
            int atIndex = withoutScheme.indexOf('@');
            String hostPort;
            String userPass = "";

            if (atIndex >= 0) {
                userPass = withoutScheme.substring(0, atIndex);
                hostPort = withoutScheme.substring(atIndex + 1);
            } else {
                hostPort = withoutScheme;
            }

            // Parse user:pass
            if (!userPass.isBlank()) {
                int colonIndex = userPass.indexOf(':');
                if (colonIndex >= 0) {
                    username = userPass.substring(0, colonIndex);
                    password = userPass.substring(colonIndex + 1);
                } else {
                    password = userPass;
                }
            }

            // Parse host:port
            String[] parts = hostPort.split(":");
            host = parts[0];
            if (parts.length > 1) {
                port = Integer.parseInt(parts[1]);
            }
        }

        // Build Redis standalone config
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration(host, port);
        redisConfig.setUsername(username);
        redisConfig.setPassword(password);

        // Configure socket options
        SocketOptions socketOptions = SocketOptions.builder()
                .connectTimeout(Duration.ofSeconds(10))
                .keepAlive(true)
                .build();

        ClientOptions clientOptions = ClientOptions.builder()
                .socketOptions(socketOptions)
                .autoReconnect(true)
                .build();

        // Build connection pool config
        GenericObjectPoolConfig<?> poolConfig = new GenericObjectPoolConfig<>();
        poolConfig.setMaxTotal(16);
        poolConfig.setMaxIdle(8);
        poolConfig.setMinIdle(2);
        poolConfig.setMaxWait(Duration.ofSeconds(5));

        // Enable SSL for rediss:// URLs (e.g., Upstash)
        LettucePoolingClientConfiguration.LettucePoolingClientConfigurationBuilder builder =
                LettucePoolingClientConfiguration.builder()
                        .poolConfig(poolConfig)
                        .commandTimeout(Duration.ofSeconds(5))
                        .clientOptions(clientOptions);

        if (useSsl) {
            builder.useSsl().disablePeerVerification();
        }

        LettuceClientConfiguration clientConfig = builder.build();

        LettuceConnectionFactory factory = new LettuceConnectionFactory(redisConfig, clientConfig);
        factory.afterPropertiesSet();
        return factory;
    }

    @Lazy
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }
}
