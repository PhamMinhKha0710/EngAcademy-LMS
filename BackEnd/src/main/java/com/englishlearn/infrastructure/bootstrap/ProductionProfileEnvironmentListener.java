package com.englishlearn.infrastructure.bootstrap;

import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;

import java.util.Arrays;

/**
 * Fail fast in prod when Render/Railway secrets are missing. Without REDIS_URL, Spring Data Redis
 * falls back to localhost:6379 inside the container → broken connections and 502 from the edge proxy.
 */
public class ProductionProfileEnvironmentListener implements ApplicationListener<ApplicationEnvironmentPreparedEvent> {

    @Override
    public void onApplicationEvent(ApplicationEnvironmentPreparedEvent event) {
        Environment env = event.getEnvironment();
        if (!Arrays.asList(env.getActiveProfiles()).contains("prod")) {
            return;
        }
        String redisUrl = env.getProperty("spring.data.redis.url");
        if (!StringUtils.hasText(redisUrl)) {
            throw new IllegalStateException(
                    "Production (prod): set REDIS_URL in Render (Upstash). "
                            + "If it is unset, Spring defaults to Redis on localhost and the app will not work in Docker.");
        }
        String rawDbUrl = env.getProperty("spring.datasource.url");
        if (StringUtils.hasText(rawDbUrl)) {
            String trimmed = rawDbUrl.trim();
            if ((trimmed.startsWith("\"") && trimmed.endsWith("\""))
                    || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
                throw new IllegalStateException(
                        "Production (prod): SPRING_DATASOURCE_URL must not include surrounding quotes on Render. "
                                + "Use jdbc:mysql://... only, without leading/trailing \" characters.");
            }
        }
        String dbUrl = stripSurroundingQuotes(rawDbUrl);
        if (!StringUtils.hasText(dbUrl)) {
            throw new IllegalStateException(
                    "Production (prod): set SPRING_DATASOURCE_URL in Render Dashboard (Aiven MySQL JDBC URL, e.g. "
                            + "jdbc:mysql://<HOST>:<PORT>/<DB>?useSSL=true&requireSSL=true&serverTimezone=UTC). "
                            + "sync: false in render.yaml means it is not in Git — you must enter it manually; "
                            + "without it Hibernate cannot read JDBC metadata and fails with 'Unable to determine Dialect'.");
        }
        String dbPassword = env.getProperty("spring.datasource.password");
        if (!StringUtils.hasText(dbPassword)) {
            throw new IllegalStateException(
                    "Production (prod): set SPRING_DATASOURCE_PASSWORD in Render Dashboard (Aiven MySQL password). "
                            + "sync: false in render.yaml means it is not in Git — you must enter it manually; empty breaks JDBC.");
        }
    }

    private static String stripSurroundingQuotes(String value) {
        if (!StringUtils.hasText(value)) {
            return value;
        }
        String trimmed = value.trim();
        if ((trimmed.startsWith("\"") && trimmed.endsWith("\""))
                || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            return trimmed.substring(1, trimmed.length() - 1);
        }
        return trimmed;
    }
}
