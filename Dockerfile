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
    SPRING_DATASOURCE_URL="jdbc:mysql://mainline.proxy.rlwy.net:53123/railway?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" \
    SPRING_DATASOURCE_USERNAME=root \
    SPRING_DATASOURCE_PASSWORD=bmqHwzikMTxdMSEsRaraCWOkJolHMWAD \
    SPRING_JPA_HIBERNATE_DDL_AUTO=none
ENTRYPOINT ["sh", "-c", "java -Xmx384m -Xms256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -jar app.jar --server.port=${PORT:-10000}"]
