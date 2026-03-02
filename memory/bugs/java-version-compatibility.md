# [Environment] Java version compatibility (22 → 17)

## Mô tả vấn đề

Project BackEnd được cấu hình hoặc build với Java 22, nhưng môi trường CI/deploy hoặc developer dùng Java 17 (hoặc ngược lại). Kết quả:
- Build fail: "invalid target release", "unsupported class file major version".
- Runtime lỗi tương thích giữa các version Java.

Commit c08470f: "Fix Java version compatibility (22 to 17) and other updates" – đã downgrade từ 22 xuống 17 để phù hợp môi trường.

## Nguyên nhân

- `pom.xml` (hoặc gradle) set `java.version` không khớp với JDK trên máy dev/CI.
- Spring Boot 3.2.2 hỗ trợ Java 17+; Java 22 có thể chưa ổn định trên một số môi trường.
- Monorepo hoặc đa developer: mỗi người có thể dùng JDK khác nhau.

## Cách debug

1. Chạy `java -version` và `mvn -v` → xem JDK đang dùng.
2. Kiểm tra `pom.xml`: `<java.version>21</java.version>` (hiện tại) hoặc 17, 22.
3. Lỗi build: "invalid target release: 22" → pom đang set 22 nhưng JDK là 17.
4. Lỗi "class file has wrong version" → compiled với JDK mới hơn, chạy trên JVM cũ hơn.

## Giải pháp

1. Thống nhất Java version trong `pom.xml`: dùng 17 hoặc 21 (LTS) tùy team.
2. Document trong README: "Requires JDK 17" hoặc "JDK 21".
3. CI: set `JAVA_HOME` hoặc `java.version` trong workflow.
4. `.sdkmanrc` hoặc `.nvmrc` tương đương: khuyến nghị dev dùng version cụ thể.

Ví dụ pom.xml:
```xml
<properties>
    <java.version>17</java.version>
</properties>
```

## Code mẫu (nếu có)

Hiện tại `BackEnd/pom.xml` có `<java.version>21</java.version>`. Commit c08470f đã sửa từ 22 xuống (có thể 17 hoặc 21 tùy lịch sử).

## Bài học rút ra

- Fix Java version sớm; không để mỗi dev dùng version khác nhau.
- Dùng LTS (17, 21) cho production; tránh version quá mới (22) trừ khi cần tính năng cụ thể.
- CI và local phải dùng cùng version.

## Cách phòng tránh sau này

1. File `.sdkmanrc` hoặc README ghi rõ: `Java 17` hoặc `Java 21`.
2. CI: `actions/setup-java` với `distribution: 'temurin'`, `java-version: '17'`.
3. Pre-commit hoặc script: check `java -version` có khớp không.
4. Xem thêm: [memory/environment/java-version-compatibility.md](../environment/java-version-compatibility.md)
