FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY BackEnd/pom.xml .
COPY BackEnd/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 10000
ENTRYPOINT ["sh", "-c", "java -Xmx384m -Xms256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -jar app.jar --server.port=${PORT:-10000} --spring.profiles.active=prod"]
