FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY BackEnd/pom.xml .
COPY BackEnd/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 10000
ENV SPRING_PROFILES_ACTIVE=prod \
    SPRING_JPA_HIBERNATE_DDL_AUTO=none
# IMPORTANT: SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, SPRING_DATASOURCE_PASSWORD
# MUST be provided via Render Dashboard environment variables (sync: false).
# Do NOT hardcode credentials here — they are sensitive and will be exposed in the image.
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=25.0 -XX:MaxMetaspaceSize=128m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -jar app.jar --server.port=${PORT:-10000}"]
