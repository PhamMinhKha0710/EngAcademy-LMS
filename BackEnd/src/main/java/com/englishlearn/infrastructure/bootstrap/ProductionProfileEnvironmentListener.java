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
        requireText("REDIS_URL", env.getProperty("spring.data.redis.url"), System.getenv("REDIS_URL"),
                "Production (prod): set REDIS_URL in Render (Upstash rediss://...). "
                        + "If it is unset, Spring defaults to Redis on localhost and the app will not work in Docker.");
        String rawDbUrl = firstNonBlank(System.getenv("SPRING_DATASOURCE_URL"), env.getProperty("spring.datasource.url"));
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
        if (!StringUtils.hasText(dbUrl) || dbUrl.contains("${")) {
            throw new IllegalStateException(
                    "Production (prod): set SPRING_DATASOURCE_URL in Render Dashboard (Aiven MySQL JDBC URL, e.g. "
                            + "jdbc:mysql://<HOST>:<PORT>/<DB>?useSSL=true&requireSSL=true&serverTimezone=UTC). "
                            + "sync: false in render.yaml means it is not in Git — you must enter it manually; "
                            + "without it Hibernate cannot read JDBC metadata and fails with 'Unable to determine Dialect'.");
        }
        if (!dbUrl.startsWith("jdbc:mysql://")) {
            throw new IllegalStateException(
                    "Production (prod): SPRING_DATASOURCE_URL must start with jdbc:mysql:// (got: "
                            + dbUrl.substring(0, Math.min(dbUrl.length(), 40)) + "...).");
        }
        requireText("SPRING_DATASOURCE_PASSWORD", env.getProperty("spring.datasource.password"),
                System.getenv("SPRING_DATASOURCE_PASSWORD"),
                "Production (prod): set SPRING_DATASOURCE_PASSWORD in Render Dashboard (Aiven MySQL password). "
                        + "sync: false in render.yaml means it is not in Git — you must enter it manually; empty breaks JDBC.");
    }

    private static void requireText(String name, String propertyValue, String envValue, String message) {
        String value = firstNonBlank(envValue, propertyValue);
        if (!StringUtils.hasText(value) || value.contains("${")) {
            throw new IllegalStateException(message);
        }
    }

    private static String firstNonBlank(String first, String second) {
        if (StringUtils.hasText(first) && !first.contains("${")) {
            return first;
        }
        if (StringUtils.hasText(second) && !second.contains("${")) {
            return second;
        }
        return StringUtils.hasText(first) ? first : second;
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
