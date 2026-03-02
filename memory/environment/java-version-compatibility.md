# Environment – Java Version Compatibility

## Mô tả vấn đề

Project BackEnd cần chạy ổn định trên nhiều môi trường (dev, CI, production). Vấn đề thường gặp:
- JDK version khác nhau giữa máy dev và CI (vd: dev dùng 22, CI dùng 17).
- Build fail: "invalid target release", "unsupported class file major version".
- Lỗi tương thích khi compile với JDK mới, chạy trên JVM cũ.

## Nguyên nhân

- `pom.xml` set `java.version` không khớp môi trường.
- Không document rõ JDK requirement.
- Spring Boot 3.2.2 hỗ trợ Java 17+; nên dùng LTS (17, 21).

## Cách debug

1. `java -version`, `mvn -v` → xác định JDK đang dùng.
2. Kiểm tra `pom.xml`: `<java.version>`.
3. Lỗi "invalid target release: X" → pom yêu cầu JDK X nhưng môi trường dùng thấp hơn.
4. Lỗi "class file has wrong version" → compiled với JDK mới, chạy trên JVM cũ.

## Giải pháp

1. **Thống nhất version**: Dùng Java 17 hoặc 21 (LTS) trong `pom.xml`.
2. **Document**: README ghi "Requires JDK 17" hoặc tương tự.
3. **CI**: `actions/setup-java` với `java-version: '17'`.
4. **Dev**: `.sdkmanrc` hoặc script check JDK version.
5. **Maven**: `maven.compiler.source` và `maven.compiler.target` = 17.

## Code mẫu (nếu có)

```xml
<!-- pom.xml -->
<properties>
    <java.version>17</java.version>
</properties>
```

```yaml
# GitHub Actions
- uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '17'
```

## Bài học rút ra

- Fix Java version sớm; tránh mỗi dev dùng version khác.
- Dùng LTS cho production; tránh version bleeding-edge (vd: 22) trừ khi cần tính năng mới.

## Cách phòng tránh sau này

1. README: "JDK 17 required".
2. Pre-commit hoặc CI: verify `java -version` có khớp không.
3. Liên quan: [memory/bugs/java-version-compatibility.md](../bugs/java-version-compatibility.md)
