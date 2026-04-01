# Hướng dẫn Deploy Production - WebLearnEnglish

**Version:** 1.0  
**Last Updated:** March 2026  
**Project:** WebLearnEnglish - Spring Boot + React/Vite Application

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Chuẩn bị VPS](#2-chuẩn-bị-vps)
3. [Cài đặt Docker & Docker Compose](#3-cài-đặt-docker--docker-compose)
4. [Cấu hình DNS](#4-cấu-hình-dns)
5. [Cài đặt Nginx Reverse Proxy](#5-cài-đặt-nginx-reverse-proxy)
6. [Cài đặt SSL với Let's Encrypt](#6-cài-đặt-ssl-với-lets-encrypt)
7. [Cấu hình file production](#7-cấu-hình-file-production)
8. [Build và Deploy](#8-build-và-deploy)
9. [Kiểm tra sau Deploy](#9-kiểm-tra-sau-deploy)
10. [CI/CD Pipeline với GitHub Actions](#10-cicd-pipeline-với-github-actions)
11. [Log Aggregation & Error Monitoring](#11-log-aggregation--error-monitoring)
12. [Health Check & Auto-Rollback](#12-health-check--auto-rollback)
13. [Security Checklist](#13-security-checklist)
14. [Các file cần tạo/sửa](#14-các-file-cần-tạosửa)

---

## 1. Tổng quan kiến trúc

### 1.1. Công nghệ sử dụng

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2.2, Java 17, Maven |
| Frontend | React 18, Vite 5, TypeScript, Tailwind CSS |
| Admin | React 19, Vite 7, Redux Toolkit, shadcn/ui |
| Database | MySQL 8.0 |
| Cache | Redis 7 |
| Web Server | Nginx (Reverse Proxy) |
| SSL | Let's Encrypt (Certbot) |
| CI/CD | GitHub Actions |
| Container | Docker + Docker Compose |

### 1.2. Kiến trúc Production

```
Internet
   |
   v
Nginx Reverse Proxy (:443, SSL)
   |
   +-- yourdomain.com     --> /var/www/html (Frontend Static)
   |
   +-- api.yourdomain.com --> Backend :8080 (Spring Boot)
   |
   +-- admin.yourdomain.com --> /var/www/admin (Admin Static)
   |
   v
Docker Network (app-network)
   |
   +-- Backend Container (:8080)
   |       |
   |       +-- MySQL (:3306)
   |       |
   |       +-- Redis (:6379)
```

### 1.3. URL Mapping Production

| URL | Content |
|-----|---------|
| `https://yourdomain.com` | FrontEnd (Student App) |
| `https://admin.yourdomain.com` | Admin Panel |
| `https://api.yourdomain.com` | Backend API |
| `https://api.yourdomain.com/swagger-ui.html` | API Documentation |

### 1.4. Thứ tự deploy thực tế

```
1.  SSH vào VPS
2.  Cài Docker + Docker Compose
3.  Clone/copy mã nguồn
4.  Cấu hình .env file
5.  Cập nhật docker-compose.yml
6.  Tạo Nginx reverse proxy config
7.  Build & Start MySQL + Redis + Backend (docker compose up -d)
8.  Chờ backend healthy
9.  Build FrontEnd + Admin (npm run build)
10. Copy dist/ ra /var/www/
11. Cài SSL với Certbot
12. Kiểm tra toàn bộ endpoints
13. Cài monitoring/logging
14. Setup backup database
```

---

## 2. Chuẩn bị VPS

### 2.1. Yêu cầu server

- OS: Ubuntu 22.04 LTS (khuyến nghị) hoặc Ubuntu 20.04
- RAM: tối thiểu 2GB (khuyến nghị 4GB+)
- CPU: 2 vCPU+
- Disk: 20GB+
- Domain đã trỏ DNS về IP VPS

### 2.2. Cập nhật hệ thống

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip ufw fail2ban htop
```

### 2.3. Mở firewall

```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### 2.4. Cài đặt Fail2Ban (chống brute-force SSH)

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2.5. Tạo thư mục project

```bash
sudo mkdir -p /opt/weblearnenglish
sudo chown $USER:$USER /opt/weblearnenglish
cd /opt/weblearnenglish
```

### 2.6. Tạo thư mục cho static files

```bash
sudo mkdir -p /var/www/html
sudo mkdir -p /var/www/admin
sudo chown -R www-data:www-data /var/www/html
sudo chown -R www-data:www-data /var/www/admin
```

### 2.7. Tạo thư mục cho logs và backups

```bash
sudo mkdir -p /var/log/weblearnenglish/{errors,summary,archive}
sudo mkdir -p /var/backups/weblearnenglish
sudo mkdir -p /var/log/spring
sudo chown -R syslog:adm /var/log/weblearnenglish
sudo chmod -R 755 /var/log/weblearnenglish
sudo chmod -R 755 /var/backups/weblearnenglish
```

---

## 3. Cài đặt Docker & Docker Compose

### 3.1. Cài Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

### 3.2. Cài Docker Compose v2

```bash
sudo apt install -y docker-compose-plugin
docker compose version
```

### 3.3. Kiểm tra Docker

```bash
docker --version
docker compose version
```

### 3.4. Enable Docker service

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

---

## 4. Cấu hình DNS

Trong panel domain của bạn (Cloudflare, Namecheap, GoDaddy...), tạo các record DNS:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `YOUR_VPS_IP` | Auto |
| A | www | `YOUR_VPS_IP` | Auto |
| A | api | `YOUR_VPS_IP` | Auto |
| A | admin | `YOUR_VPS_IP` | Auto |

**Lưu ý:** Nếu dùng Cloudflare, đặt proxy mode là "DNS only" (tắt proxy) lúc đầu để Certbot verify được, sau đó có thể bật lại.

---

## 5. Cài đặt Nginx Reverse Proxy

### 5.1. Cài Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 5.2. Tạo Nginx config chính

```bash
sudo nano /etc/nginx/sites-available/weblearnenglish
```

Copy toàn bộ nội dung sau vào file:

```nginx
# Upstream backend
upstream backend {
    server 127.0.0.1:8080;
    keepalive 32;
}

# Frontend - Port 3000
upstream frontend {
    server 127.0.0.1:3000;
    keepalive 16;
}

# Admin - Port 3001
upstream admin {
    server 127.0.0.1:3001;
    keepalive 16;
}

# HTTP -> HTTPS redirect for all subdomains
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com api.yourdomain.com admin.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# ============================================
# MAIN DOMAIN - Frontend App
# ============================================
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.yourdomain.com;" always;

    root /var/www/html;
    index index.html;

    # Logging
    access_log /var/log/nginx/frontend_access.log;
    error_log /var/log/nginx/frontend_error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;

    # Serve static files
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # API calls go to backend
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 60;
        proxy_send_timeout 300;
        client_max_body_size 50M;
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }

    # Swagger UI
    location /swagger-ui/ {
        proxy_pass http://backend;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /v3/api-docs {
        proxy_pass http://backend;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static file caching (JS, CSS, images)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$ {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Block sensitive paths
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}

# ============================================
# API SUBDOMAIN - Backend API
# ============================================
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/api_access.log;
    error_log /var/log/nginx/api_error.log;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 60;
        proxy_send_timeout 300;
        client_max_body_size 50M;
    }

    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        proxy_read_timeout 86400;
    }
}

# ============================================
# ADMIN SUBDOMAIN - Admin Panel
# ============================================
server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # Logging
    access_log /var/log/nginx/admin_access.log;
    error_log /var/log/nginx/admin_error.log;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json;

    location / {
        proxy_pass http://admin;
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }

    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }
}
```

### 5.3. Enable site

```bash
# Disable default site
sudo rm /etc/nginx/sites-enabled/default

# Enable our site
sudo ln -s /etc/nginx/sites-available/weblearnenglish /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## 6. Cài đặt SSL với Let's Encrypt

### 6.1. Cài Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2. Cài SSL cho tất cả subdomains

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com -d admin.yourdomain.com
```

- Nhập email để nhận thông báo hết hạn
- Chọn "No redirect" vì Nginx config đã có redirect HTTP -> HTTPS

### 6.3. Auto-renew SSL (Certbot tự động tạo cron job)

```bash
# Kiểm tra auto-renew
sudo certbot renew --dry-run

# Kiểm tra timer
sudo systemctl status certbot.timer
```

### 6.4. Nếu Certbot fail (DNS not propagated)

```bash
# Thử standalone mode
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com -d admin.yourdomain.com
```

---

## 7. Cấu hình file production

### 7.1. Tạo file `.env`

```bash
cd /opt/weblearnenglish
nano .env
```

Nội dung:

```bash
# MySQL
MYSQL_ROOT_PASSWORD=YourSuperSecureRootPassword123!
DB_USER=englishlearn
DB_PASSWORD=YourSuperSecureDBPassword123!

# Redis
REDIS_PASSWORD=YourSuperSecureRedisPassword123!

# JWT - Tao bang: openssl rand -base64 64
JWT_SECRET_KEY=YOUR_VERY_LONG_BASE64_ENCODED_SECRET_KEY_HERE_MUST_BE_AT_LEAST_256_BITS

# Email (Gmail App Password)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Domain
DOMAIN=yourdomain.com
```

**Tạo JWT Secret:**

```bash
openssl rand -base64 64
# Copy output vào JWT_SECRET_KEY trong .env
```

### 7.2. Tạo `application-prod.properties`

File: `BackEnd/src/main/resources/application-prod.properties`

```properties
# Production profile
spring.profiles.active=prod
server.port=8080

# MySQL Production
spring.datasource.url=jdbc:mysql://mysql:3306/englishlearn?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=${DB_USER:englishlearn}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT Secret
application.security.jwt.secret-key=${JWT_SECRET_KEY}
application.security.jwt.expiration=86400000
application.security.jwt.refresh-token.expiration=604800000

# CORS Production
application.cors.allowed-origins=https://yourdomain.com,https://www.yourdomain.com,https://api.yourdomain.com

# Redis
spring.data.redis.host=${SPRING_DATA_REDIS_HOST:redis}
spring.data.redis.port=${SPRING_DATA_REDIS_PORT:6379}
spring.data.redis.password=${SPRING_DATA_REDIS_PASSWORD:}

# Cache Config
spring.cache.type=redis
spring.cache.redis.time-to-live=3600000

# Rate Limiting - enabled in production
rate-limit.max-attempts=100
rate-limit.window-seconds=60
rate-limit.enabled=true

# Email/Gmail SMTP
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Logging for production
logging.level.root=INFO
logging.level.com.englishlearn=INFO
logging.level.org.springframework.web=WARN
logging.level.org.hibernate=INFO
logging.level.org.hibernate.SQL=WARN

# Actuator
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=when_authorized
management.metrics.export.prometheus.enabled=true

# File upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=50MB
```

### 7.3. Cập nhật `docker-compose.yml`

File: `docker-compose.yml` (production - chỉ backend + MySQL + Redis)

```yaml
services:
  mysql:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: englishlearn
      MYSQL_USER: ${DB_USER:-englishlearn}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "127.0.0.1:3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"
    networks:
      - app-network

  backend:
    build: ./BackEnd
    restart: always
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/englishlearn?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
      SPRING_DATASOURCE_USERNAME: ${DB_USER:-englishlearn}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      SPRING_DATA_REDIS_HOST: redis
      SPRING_DATA_REDIS_PASSWORD: ${REDIS_PASSWORD}
      MAIL_USERNAME: ${MAIL_USERNAME}
      MAIL_PASSWORD: ${MAIL_PASSWORD}
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    ports:
      - "127.0.0.1:8080:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
    networks:
      - app-network
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "10"

volumes:
  mysql_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### 7.4. Cập nhật `FrontEnd/Dockerfile`

File: `FrontEnd/Dockerfile`

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

### 7.5. Cập nhật `FrontEnd/nginx.conf`

File: `FrontEnd/nginx.conf`

```nginx
server {
    listen 3000;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    location /ws {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 7.6. Tạo `Admin/Dockerfile`

File: `Admin/Dockerfile`

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"]
```

### 7.7. Tạo `Admin/nginx.conf`

File: `Admin/nginx.conf`

```nginx
server {
    listen 3001;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 7.8. Cập nhật `docker-compose.yml` - thêm Frontend & Admin

```yaml
# THEM VAO docker-compose.yml

  frontend:
    build:
      context: ./FrontEnd
      args:
        VITE_API_URL: https://api.yourdomain.com
    restart: always
    ports:
      - "127.0.0.1:3000:3000"
    networks:
      - app-network

  admin:
    build:
      context: ./Admin
      args:
        VITE_API_URL: https://api.yourdomain.com
    restart: always
    ports:
      - "127.0.0.1:3001:3001"
    networks:
      - app-network
```

---

## 8. Build và Deploy

### 8.1. Upload mã nguồn lên VPS

**Từ local (PowerShell/CMD):**

```bash
scp -r D:/DaiHoc/J2EJava/weblearnenglish/* user@your-vps-ip:/opt/weblearnenglish/
```

Hoặc git clone trên VPS:

```bash
cd /opt/weblearnenglish
git init
git remote add origin https://github.com/YOUR_USERNAME/weblearnenglish.git
git pull origin main
```

### 8.2. Build Docker images

```bash
cd /opt/weblearnenglish

# Build all images
docker compose build

# Build backend only (nhanh hon khi chi thay doi code)
docker compose build backend
```

### 8.3. Start services

```bash
# Start all services
docker compose up -d

# Kiểm tra status
docker compose ps

# Xem logs
docker compose logs -f backend
```

### 8.4. Chờ backend healthy

```bash
# Check health
for i in {1..30}; do
  if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "Backend is healthy!"
    break
  fi
  echo "Waiting for backend... ($i/30)"
  sleep 5
done
```

### 8.5. Build Frontend va Admin tren VPS

```bash
# Build FrontEnd
docker run --rm \
  -v $(pwd)/FrontEnd:/app \
  -w /app \
  -e VITE_API_URL=https://api.yourdomain.com \
  node:20-alpine \
  sh -c "npm install && npm run build"

# Build Admin
docker run --rm \
  -v $(pwd)/Admin:/app \
  -w /app \
  -e VITE_API_URL=https://api.yourdomain.com \
  node:20-alpine \
  sh -c "npm install && npm run build"
```

### 8.6. Copy static files ra Nginx

```bash
# Copy Frontend
sudo cp -r $(pwd)/FrontEnd/dist/* /var/www/html/

# Copy Admin
sudo cp -r $(pwd)/Admin/dist/* /var/www/admin/

# Phan quyen
sudo chown -R www-data:www-data /var/www/html
sudo chown -R www-data:www-data /var/www/admin
```

### 8.7. Start Frontend va Admin Docker containers

```bash
docker compose up -d --build frontend admin
```

### 8.8. Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 8.9. Verify all services

```bash
# Check all containers
docker compose ps

# Check frontend
curl -I https://yourdomain.com

# Check backend
curl https://api.yourdomain.com/api/v1/actuator/health

# Check admin
curl -I https://admin.yourdomain.com
```

---

## 9. Kiểm tra sau Deploy

### 9.1. Kiểm tra endpoints

```bash
# Backend health
curl https://api.yourdomain.com/api/v1/actuator/health

# Swagger UI
curl -I https://api.yourdomain.com/swagger-ui/index.html

# Frontend
curl -I https://yourdomain.com

# Admin
curl -I https://admin.yourdomain.com
```

### 9.2. Kiểm tra database migration

```bash
docker compose logs backend | grep -i flyway
```

### 9.3. Kiểm tra SSL

```bash
sudo certbot certificates
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### 9.4. Kiểm tra logs

```bash
# Backend logs
docker compose logs -f backend

# Nginx logs
sudo tail -f /var/log/nginx/frontend_access.log
sudo tail -f /var/log/nginx/api_access.log
```

---

## 10. CI/CD Pipeline với GitHub Actions

### 10.1. Tao GitHub Repository Secrets

Trong GitHub repo > Settings > Secrets and variables > Actions, thêm cac Secret sau:

| Secret Name | Value |
|-------------|-------|
| `VPS_HOST` | IP address cua VPS |
| `VPS_USER` | SSH username (vi du: `root`) |
| `VPS_SSH_KEY` | Private key SSH |
| `VPS_SSH_PORT` | SSH port (mac dinh: `22`) |
| `DOMAIN` | Domain name |
| `JWT_SECRET_KEY` | JWT secret base64 |
| `DB_PASSWORD` | MySQL password |
| `REDIS_PASSWORD` | Redis password |
| `MAIL_USERNAME` | Gmail username |
| `MAIL_PASSWORD` | Gmail app password |
| `SLACK_WEBHOOK_URL` | Slack webhook URL (tuy chon) |
| `ALERT_EMAIL` | Email nhan alert (tuy chon) |

### 10.2. Tao SSH Key cho GitHub Actions

```bash
# Tren local
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Copy public key len VPS
cat ~/.ssh/github_actions.pub | ssh user@your-vps-ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# Copy private key vao GitHub Secrets (VPS_SSH_KEY)
cat ~/.ssh/github_actions
```

### 10.3. Tao `.github/workflows/deploy.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main

env:
  JAVA_VERSION: '17'
  NODE_VERSION: '20'

jobs:
  # =========================================
  # JOB 1: Backend Tests & Build
  # =========================================
  backend-test:
    name: Backend Test & Build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: BackEnd

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: englishlearn_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Java ${{ env.JAVA_VERSION }}
        uses: actions/setup-java@v4
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: 'temurin'
          cache: 'maven'

      - name: Cache Maven packages
        uses: actions/cache@v4
        with:
          path: ~/.m2/repository
          key: ${{ runner.os }}-maven-${{ hashFiles('BackEnd/pom.xml') }}
          restore-keys: ${{ runner.os }}-maven-

      - name: Run Maven tests
        run: mvn clean test -B
        env:
          SPRING_PROFILES_ACTIVE: test
          SPRING_DATASOURCE_URL: jdbc:mysql://localhost:3306/englishlearn_test
          SPRING_DATASOURCE_USERNAME: root
          SPRING_DATASOURCE_PASSWORD: root
          SPRING_DATA_REDIS_HOST: localhost

      - name: Build JAR
        run: mvn clean package -DskipTests -B

      - name: Upload JAR artifact
        uses: actions/upload-artifact@v4
        with:
          name: backend-jar
          path: BackEnd/target/*.jar
          retention-days: 7

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: backend-test-results
          path: BackEnd/target/surefire-reports/*.xml
          retention-days: 14

  # =========================================
  # JOB 2: Frontend Tests & Build
  # =========================================
  frontend-test:
    name: Frontend Test & Build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: FrontEnd

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: FrontEnd/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint || true

      - name: Run TypeScript type check
        run: npx tsc --noEmit

      - name: Build Frontend
        run: npm run build
        env:
          VITE_API_URL: https://api.${{ vars.DOMAIN || 'example.com' }}

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: FrontEnd/dist
          retention-days: 7

  # =========================================
  # JOB 3: Admin Tests & Build
  # =========================================
  admin-test:
    name: Admin Test & Build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: Admin

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: Admin/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint || true

      - name: Build Admin
        run: npm run build
        env:
          VITE_API_URL: https://api.${{ vars.DOMAIN || 'example.com' }}

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: admin-dist
          path: Admin/dist
          retention-days: 7

  # =========================================
  # JOB 4: Deploy to Production (main branch)
  # =========================================
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [backend-test, frontend-test, admin-test]
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.VPS_SSH_KEY }}

      - name: Add known hosts
        run: |
          ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts 2>/dev/null

      - name: Download all artifacts
        uses: actions/download-artifact@v4
        with:
          path: /tmp/artifacts

      - name: Deploy to VPS (Production)
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_SSH_PORT || 22 }}
          envs: DOMAIN
          script: |
            set -e
            cd /opt/weblearnenglish

            # Copy artifacts
            cp /tmp/artifacts/backend-jar/*.jar BackEnd/target/app.jar
            sudo cp -r /tmp/artifacts/frontend-dist/* /var/www/html/
            sudo cp -r /tmp/artifacts/admin-dist/* /var/www/admin/

            # Update .env file
            cat > .env << 'ENVEOF'
MYSQL_ROOT_PASSWORD=${{ secrets.DB_PASSWORD }}
DB_USER=englishlearn
DB_PASSWORD=${{ secrets.DB_PASSWORD }}
REDIS_PASSWORD=${{ secrets.REDIS_PASSWORD }}
JWT_SECRET_KEY=${{ secrets.JWT_SECRET_KEY }}
MAIL_USERNAME=${{ secrets.MAIL_USERNAME }}
MAIL_PASSWORD=${{ secrets.MAIL_PASSWORD }}
ENVEOF

            # Rebuild and restart backend
            docker compose build backend
            docker compose up -d --no-deps backend

            # Rebuild and restart frontend & admin
            docker compose up -d --build frontend admin

            # Wait for backend to be healthy
            echo "Waiting for backend..."
            for i in {1..30}; do
              if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
                echo "Backend is healthy!"
                break
              fi
              echo "Waiting... ($i/30)"
              sleep 5
            done

            # Reload Nginx
            sudo nginx -t && sudo systemctl reload nginx

            # Set permissions
            sudo chown -R www-data:www-data /var/www/html
            sudo chown -R www-data:www-data /var/www/admin

            echo "Deploy completed!"

      - name: Health check production
        run: |
          echo "Waiting for services to stabilize..."
          sleep 45

          echo "Checking frontend..."
          HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${{ secrets.DOMAIN }}/)
          if [ "$HTTP_STATUS" != "200" ]; then
            echo "Frontend check failed: HTTP $HTTP_STATUS"
            exit 1
          fi

          echo "Checking API..."
          HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.${{ secrets.DOMAIN }}/api/v1/actuator/health)
          if [ "$HTTP_STATUS" != "200" ]; then
            echo "API check failed: HTTP $HTTP_STATUS"
            exit 1
          fi

          echo "Checking admin..."
          HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://admin.${{ secrets.DOMAIN }}/)
          if [ "$HTTP_STATUS" != "200" ]; then
            echo "Admin check failed: HTTP $HTTP_STATUS"
            exit 1
          fi

          echo "All health checks passed!"

      - name: Send Slack notification on success
        if: success()
        uses: slackapi/slack-github-action@v1.26.0
        with:
          payload: |
            {
              "text": "Deploy thanh cong!",
              "blocks": [{
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*Deploy Production Thanh Cong*\nCommit: `${{ github.sha }}`\nAuthor: `${{ github.actor }}`\nURLs:\n- Frontend: https://${{ secrets.DOMAIN }}\n- API: https://api.${{ secrets.DOMAIN }}\n- Admin: https://admin.${{ secrets.DOMAIN }}"
                }
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
        continue-on-error: true

      - name: Send Slack notification on failure
        if: failure()
        uses: slackapi/slack-github-action@v1.26.0
        with:
          payload: |
            {
              "text": "Deploy that bai!",
              "blocks": [{
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*Deploy Production That Bai*\nCommit: `${{ github.sha }}`\nAuthor: `${{ github.actor }}`\nLink: https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                }
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
        continue-on-error: true

  # =========================================
  # JOB 5: Deploy to Staging (develop branch)
  # =========================================
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [backend-test, frontend-test, admin-test]
    if: github.ref == 'refs/heads/develop'
    environment: staging

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.VPS_SSH_KEY }}

      - name: Add known hosts
        run: ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts 2>/dev/null

      - name: Download artifacts
        uses: actions/download-artifact@v4
        with:
          path: /tmp/artifacts

      - name: Deploy to Staging VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_SSH_PORT || 22 }}
          script: |
            set -e
            cd /opt/weblearnenglish-staging
            cp /tmp/artifacts/backend-jar/*.jar BackEnd/target/app.jar 2>/dev/null || mkdir -p BackEnd/target && cp /tmp/artifacts/backend-jar/*.jar BackEnd/target/app.jar
            sudo cp -r /tmp/artifacts/frontend-dist/* /var/www/staging/ 2>/dev/null || (sudo mkdir -p /var/www/staging && sudo cp -r /tmp/artifacts/frontend-dist/* /var/www/staging/)
            sudo cp -r /tmp/artifacts/admin-dist/* /var/www/staging-admin/ 2>/dev/null || (sudo mkdir -p /var/www/staging-admin && sudo cp -r /tmp/artifacts/admin-dist/* /var/www/staging-admin/)
            docker compose -f docker-compose.staging.yml up -d --build

      - name: Health check staging
        run: |
          sleep 30
          curl -f https://staging.${{ secrets.DOMAIN }}/api/v1/actuator/health || exit 1

  # =========================================
  # JOB 6: Security Scan
  # =========================================
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: [backend-test]
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'
```

### 10.4. Tao `docker-compose.staging.yml`

```yaml
# Staging environment
services:
  mysql:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: englishlearn_staging
      MYSQL_USER: ${DB_USER:-englishlearn}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_staging_data:/var/lib/mysql
    ports:
      - "127.0.0.1:3307:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 10
    networks:
      - staging-network

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_staging_data:/data
    ports:
      - "127.0.0.1:6380:6379"
    networks:
      - staging-network

  backend:
    build: ./BackEnd
    restart: always
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/englishlearn_staging
      SPRING_DATASOURCE_USERNAME: ${DB_USER:-englishlearn}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      SPRING_DATA_REDIS_HOST: redis
      SPRING_DATA_REDIS_PASSWORD: ${REDIS_PASSWORD}
      MAIL_USERNAME: ${MAIL_USERNAME}
      MAIL_PASSWORD: ${MAIL_PASSWORD}
    depends_on:
      mysql:
        condition: service_healthy
    ports:
      - "127.0.0.1:8081:8080"
    networks:
      - staging-network

  frontend:
    build:
      context: ./FrontEnd
      args:
        VITE_API_URL: https://staging.api.yourdomain.com
    restart: always
    ports:
      - "127.0.0.1:3002:3000"
    networks:
      - staging-network

  admin:
    build:
      context: ./Admin
      args:
        VITE_API_URL: https://staging.api.yourdomain.com
    restart: always
    ports:
      - "127.0.0.1:3003:3001"
    networks:
      - staging-network

volumes:
  mysql_staging_data:
  redis_staging_data:

networks:
  staging-network:
    driver: bridge
```

---

## 11. Log Aggregation & Error Monitoring

### 11.1. Tao scripts directory

```bash
mkdir -p /opt/weblearnenglish/scripts
```

### 11.2. Script log-aggregator.sh

```bash
nano /opt/weblearnenglish/scripts/log-aggregator.sh
```

```bash
#!/bin/bash
# scripts/log-aggregator.sh
# Chay moi 5 phut qua cron de tong hop log va phat hien loi

set -euo pipefail

LOG_DIR="/var/log/weblearnenglish"
ARCHIVE_DIR="/var/log/weblearnenglish/archive"
WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
ERROR_THRESHOLD=10  # Alert neu co > 10 loi trong 5 phut

mkdir -p "$LOG_DIR/errors" "$LOG_DIR/summary" "$ARCHIVE_DIR"

DATE=$(date +%Y%m%d_%H%M)
BACKEND_ERRORS_FILE="$LOG_DIR/errors/backend_errors_${DATE}.log"
DOCKER_ERRORS_FILE="$LOG_DIR/errors/docker_errors_${DATE}.log"
SUMMARY_FILE="$LOG_DIR/summary/summary_${DATE}.txt"

echo "[$(date)] Starting log aggregation..."

# 1. Parse Docker container logs - loc loi
docker compose -f /opt/weblearnenglish/docker-compose.yml logs --since 5m backend 2>/dev/null | \
    grep -iE "(ERROR|Exception|FATAL|fail|crash)" >> "$DOCKER_ERRORS_FILE" || true
DOCKER_ERRORS_COUNT=$(wc -l < "$DOCKER_ERRORS_FILE" 2>/dev/null || echo "0")

# 2. Parse Nginx 5xx errors
NGINX_5XX_COUNT=0
for logfile in /var/log/nginx/*_access.log; do
    [ -f "$logfile" ] || continue
    COUNT=$(grep -E " [5][0-9]{2} " "$logfile" 2>/dev/null | wc -l || echo "0")
    ((NGINX_5XX_COUNT += COUNT)) || true
done

# 3. Parse Nginx 4xx errors
NGINX_4XX_COUNT=0
for logfile in /var/log/nginx/*_access.log; do
    [ -f "$logfile" ] || continue
    COUNT=$(grep -E " [4][0-9]{2} " "$logfile" 2>/dev/null | wc -l || echo "0")
    ((NGINX_4XX_COUNT += COUNT)) || true
done

# 4. Check backend health
BACKEND_HEALTH=$(curl -sf http://localhost:8080/actuator/health 2>/dev/null || echo '{"status":"DOWN"}')
BACKEND_STATUS=$(echo "$BACKEND_HEALTH" | grep -oP '"status":"\K[^"]+' || echo "DOWN")

echo "Docker errors: $DOCKER_ERRORS_COUNT | Nginx 5xx: $NGINX_5XX_COUNT | Nginx 4xx: $NGINX_4XX_COUNT | Status: $BACKEND_STATUS"

# 5. Tao summary
cat > "$SUMMARY_FILE" << EOF
===========================================
WEBLEARNENGLISH LOG SUMMARY
Generated: $(date)
Time window: Last 5 minutes
===========================================

BACKEND STATUS: $BACKEND_STATUS

ERROR COUNTS:
- Docker Errors: $DOCKER_ERRORS_COUNT
- Nginx 5xx: $NGINX_5XX_COUNT
- Nginx 4xx: $NGINX_4XX_COUNT

DOCKER CONTAINER STATUS:
$(docker compose -f /opt/weblearnenglish/docker-compose.yml ps --format "table {{.Name}}\t{{.Status}}" 2>/dev/null || echo "N/A")

SYSTEM RESOURCES:
- Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')
- Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}')
- Load: $(uptime | awk -F'load average:' '{print $2}')

LATEST DOCKER ERRORS:
$(tail -n 10 "$DOCKER_ERRORS_FILE" 2>/dev/null || echo "No errors")
===========================================
EOF

# 6. Alert logic
ALERT_TRIGGERED=false
ALERT_MESSAGE=""

if [ "$BACKEND_STATUS" = "DOWN" ]; then
    ALERT_TRIGGERED=true
    ALERT_MESSAGE="${ALERT_MESSAGE}BACKEND IS DOWN!\n"
fi
if [ "$DOCKER_ERRORS_COUNT" -gt "$ERROR_THRESHOLD" ]; then
    ALERT_TRIGGERED=true
    ALERT_MESSAGE="${ALERT_MESSAGE}High Docker error count: $DOCKER_ERRORS_COUNT\n"
fi
if [ "$NGINX_5XX_COUNT" -gt "$ERROR_THRESHOLD" ]; then
    ALERT_TRIGGERED=true
    ALERT_MESSAGE="${ALERT_MESSAGE}High 5xx count: $NGINX_5XX_COUNT\n"
fi

# 7. Gui Slack notification
if [ "$ALERT_TRIGGERED" = true ] && [ -n "$WEBHOOK_URL" ]; then
    curl -s -X POST "$WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{
            \"text\": \"WebLearnEnglish Alert\",
            \"blocks\": [{
                \"type\": \"section\",
                \"text\": {
                    \"type\": \"mrkdwn\",
                    \"text\": \"$ALERT_MESSAGE\nBackend: $BACKEND_STATUS\n5xx: $NGINX_5XX_COUNT | 4xx: $NGINX_4XX_COUNT\nDocker errors: $DOCKER_ERRORS_COUNT\n$(date)\"
                }
            }]
        }" || true
fi

# 8. Cleanup old logs
find "$LOG_DIR/errors" -name "*.log" -mmin +60 -delete 2>/dev/null || true
find "$LOG_DIR/summary" -name "summary_*.txt" -mtime +7 -delete 2>/dev/null || true

echo "[$(date)] Done. Alerts: $([ "$ALERT_TRIGGERED" = true ] && echo 'SENT' || echo 'NONE')"
```

### 11.3. Script health-check.sh

```bash
nano /opt/weblearnenglish/scripts/health-check.sh
```

```bash
#!/bin/bash
# scripts/health-check.sh
# Chay moi phut qua cron de check health va tu dong restart neu can

set -euo pipefail

MAX_RESTARTS=3
RESTART_WINDOW=300  # 5 phut
BACKUP_DIR="/var/backups/weblearnenglish"

mkdir -p "$BACKUP_DIR"

cd /opt/weblearnenglish

# Kiem tra backend health
HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>/dev/null || echo "000")

if [ "$HTTP_CODE" != "200" ]; then
    echo "[$(date)] Backend unhealthy (HTTP $HTTP_CODE), attempting restart..."

    # Dem so lan restart gan day
    RECENT_RESTARTS=$(find "$BACKUP_DIR" -name "restart_*.log" -mmin -$((RESTART_WINDOW/60)) 2>/dev/null | wc -l || echo "0")

    if [ "$RECENT_RESTARTS" -ge "$MAX_RESTARTS" ]; then
        echo "[$(date)] Too many restarts ($RECENT_RESTARTS), manual intervention required!"
        if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
            curl -s -X POST "$SLACK_WEBHOOK_URL" \
                -H 'Content-Type: application/json' \
                -d '{"text": "Backend requires manual intervention! Too many auto-restarts."}' || true
        fi
        exit 1
    fi

    # Restart backend
    docker compose restart backend
    touch "$BACKUP_DIR/restart_$(date +%Y%m%d_%H%M%S).log"

    # Cho va kiem tra lai
    sleep 30
    NEW_CODE=$(curl -sf -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>/dev/null || echo "000")

    if [ "$NEW_CODE" != "200" ]; then
        echo "[$(date)] Backend still unhealthy after restart!"
        if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
            curl -s -X POST "$SLACK_WEBHOOK_URL" \
                -H 'Content-Type: application/json' \
                -d '{"text": "Backend restart failed! Manual check needed."}' || true
        fi
        exit 1
    fi

    echo "[$(date)] Backend restarted and healthy."
fi

# Kiem tra disk space
USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$USAGE" -gt 85 ]; then
    echo "[$(date)] Disk usage high: ${USAGE}%"
    docker image prune -af --filter "until=24h" || true
    find /var/log/weblearnenglish/archive -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true
fi

# Kiem tra memory
MEM_USAGE=$(free | awk '/^Mem:/ {printf "%.0f", ($3/$2)*100}')
if [ "$MEM_USAGE" -gt 90 ]; then
    echo "[$(date)] Memory usage high: ${MEM_USAGE}%"
    docker compose restart backend
fi

echo "[$(date)] Health checks completed."
```

### 11.4. Script rollback.sh

```bash
nano /opt/weblearnenglish/scripts/rollback.sh
```

```bash
#!/bin/bash
# scripts/rollback.sh
# Rollback ve version truoc

set -euo pipefail

VERSION=${1:-}
PROJECT_DIR="/opt/weblearnenglish"
BACKUP_DIR="/var/backups/weblearnenglish"
MAX_BACKUPS=10

if [ -z "$VERSION" ]; then
    echo "Usage: $0 <backup-timestamp|latest>"
    echo ""
    echo "Available backups:"
    ls -la "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | tail -5 || echo "No backups found"
    exit 1
fi

echo "=== Starting rollback to: $VERSION ==="

# Backup current state truoc
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CURRENT_BACKUP="$BACKUP_DIR/current_before_rollback_${TIMESTAMP}.tar.gz"

echo "Backing up current state..."
tar -czf "$CURRENT_BACKUP" -C "$PROJECT_DIR" \
    BackEnd/target/*.jar \
    FrontEnd/dist \
    Admin/dist \
    .env \
    2>/dev/null || true

# Tim backup
if [ "$VERSION" = "latest" ]; then
    LAST_BACKUP=$(ls -t "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | head -1)
    [ -z "$LAST_BACKUP" ] && echo "No backup found!" && exit 1
    echo "Rolling back to: $LAST_BACKUP"
    tar -xzf "$LAST_BACKUP" -C "$PROJECT_DIR"
else
    BACKUP_FILE=$(ls "$BACKUP_DIR"/backup_${VERSION}*.tar.gz 2>/dev/null | head -1)
    [ -z "$BACKUP_FILE" ] && echo "Backup not found: $VERSION" && exit 1
    tar -xzf "$BACKUP_FILE" -C "$PROJECT_DIR"
fi

# Restart services
echo "Restarting services..."
cd "$PROJECT_DIR"
docker compose up -d --build backend
docker compose up -d --build frontend
docker compose up -d --build admin
sudo cp -r FrontEnd/dist/* /var/www/html/
sudo cp -r Admin/dist/* /var/www/admin/
sudo nginx -t && sudo systemctl reload nginx

# Health check
echo "Running health check..."
sleep 30

if curl -sf http://localhost:8080/actuator/health > /dev/null; then
    echo "Rollback successful!"
    ls -t "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | tail -n +$((MAX_BACKUPS+1)) | xargs rm -f 2>/dev/null || true
    exit 0
else
    echo "Health check failed! Restoring..."
    tar -xzf "$CURRENT_BACKUP" -C "$PROJECT_DIR"
    docker compose restart backend
    exit 1
fi
```

### 11.5. Script auto-backup.sh

```bash
nano /opt/weblearnenglish/scripts/auto-backup.sh
```

```bash
#!/bin/bash
# scripts/auto-backup.sh
# Chay hang ngay qua cron de backup database va code

set -euo pipefail

PROJECT_DIR="/opt/weblearnenglish"
BACKUP_DIR="/var/backups/weblearnenglish"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"
DATE=$(date +%Y%m%d_%H%M%S)

echo "[$(date)] Starting backup..."

# 1. Backup database
docker compose -f "$PROJECT_DIR/docker-compose.yml" exec -T mysql mysqldump \
    -u root -p"${MYSQL_ROOT_PASSWORD:-root}" \
    --single-transaction \
    --routines \
    --triggers \
    englishlearn 2>/dev/null | gzip > "$BACKUP_DIR/db_backup_${DATE}.sql.gz"

echo "Database backup: $(du -h "$BACKUP_DIR/db_backup_${DATE}.sql.gz" | cut -f1)"

# 2. Backup code
tar -czf "$BACKUP_DIR/code_backup_${DATE}.tar.gz" \
    -C "$PROJECT_DIR" \
    BackEnd/target/*.jar \
    FrontEnd/dist \
    Admin/dist \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='target' \
    --exclude='dist' \
    2>/dev/null || true

# 3. Backup env file
[ -f "$PROJECT_DIR/.env" ] && cp "$PROJECT_DIR/.env" "$BACKUP_DIR/env_${DATE}.bak"

# 4. Cleanup old backups
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "code_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "env_*.bak" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

# 5. Optional: Sync to S3
if [ -n "${BACKUP_S3_BUCKET:-}" ]; then
    aws s3 sync "$BACKUP_DIR" "s3://$BACKUP_S3_BUCKET/" --delete --storage-class GLACIER || true
fi

echo "[$(date)] Backup completed."
```

### 11.6. Cai dat cron jobs

```bash
# Phan quyen script
sudo chmod +x /opt/weblearnenglish/scripts/*.sh

# Copy vao /usr/local/bin
sudo cp /opt/weblearnenglish/scripts/log-aggregator.sh /usr/local/bin/
sudo cp /opt/weblearnenglish/scripts/health-check.sh /usr/local/bin/
sudo cp /opt/weblearnenglish/scripts/rollback.sh /usr/local/bin/
sudo cp /opt/weblearnenglish/scripts/auto-backup.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/*.sh

# Tao crontab
sudo crontab -e
```

Them cac dong sau:

```cron
# Health check moi phut
* * * * * /usr/local/bin/health-check.sh >> /var/log/weblearnenglish/health-check.log 2>&1

# Auto backup hang ngay luc 3h sang
0 3 * * * /usr/local/bin/auto-backup.sh >> /var/log/weblearnenglish/backup.log 2>&1

# Log aggregation moi 5 phut
*/5 * * * * /usr/local/bin/log-aggregator.sh >> /var/log/weblearnenglish/aggregator.log 2>&1
```

### 11.7. Kiem tra cron

```bash
# Xem cron jobs
sudo crontab -l

# Xem log
sudo tail -f /var/log/weblearnenglish/health-check.log
sudo tail -f /var/log/weblearnenglish/aggregator.log
```

---

## 12. Health Check & Auto-Rollback

### 12.1. Kiem tra log tong hop

```bash
# Xem summary moi nhat
cat /var/log/weblearnenglish/summary/summary_*.txt | tail -30

# Xem loi backend
cat /var/log/weblearnenglish/errors/backend_errors_*.log | tail -20

# Xem Docker logs
docker compose logs --tail 50 backend
```

### 12.2. Kiem tra container status

```bash
docker compose ps
docker stats --no-stream
```

### 12.3. Rollback thu cong

```bash
# Rollback ve backup gan nhat
sudo /usr/local/bin/rollback.sh latest

# Rollback ve backup cu the (timestamp)
/usr/local/bin/rollback.sh 20260328_030000
```

### 12.4. Xem backup available

```bash
ls -la /var/backups/weblearnenglish/
```

---

## 13. Security Checklist

### 13.1. Mat khau

- [ ] Doi tat ca default passwords (MySQL, Redis)
- [ ] Tao JWT secret moi (64+ bytes base64)
- [ ] Su dung Gmail App Password thay vi real password cho email

### 13.2. Firewall

- [ ] Chi mo port 80, 443, 22 (SSH)
- [ ] MySQL/Redis port chi bind localhost (127.0.0.1)

### 13.3. SSH

- [ ] Cai dat fail2ban chan brute-force
- [ ] Su dung SSH key thay vi password
- [ ] Doi SSH port hoac cam dang nhap root

### 13.4. SSL

- [ ] Bat auto-renew SSL
- [ ] Kiem tra SSL certificate hang thang

### 13.5. Application

- [ ] Tat `spring.jpa.show-sql=false` trong production
- [ ] Tat sensitive endpoints khoi public (actuator health chi tra ve 200 khi authorized)
- [ ] Backup database dinh ky

### 13.6. Nginx

- [ ] Tat server_tokens off
- [ ] Them security headers
- [ ] Cau hinh rate limiting

---

## 14. Cac file can tao/sua

| # | File | Action | Notes |
|---|------|--------|-------|
| 1 | `BackEnd/src/main/resources/application-prod.properties` | Create | Cau hinh production |
| 2 | `docker-compose.yml` | Update | Chi backend + MySQL + Redis + Frontend + Admin |
| 3 | `FrontEnd/nginx.conf` | Update | Proxy to backend |
| 4 | `FrontEnd/Dockerfile` | Update | Nhan VITE_API_URL build arg |
| 5 | `Admin/nginx.conf` | Create | Proxy to backend |
| 6 | `Admin/Dockerfile` | Create | Build and serve admin panel |
| 7 | `.env` | Create | **Khong commit git!** |
| 8 | `/etc/nginx/sites-available/weblearnenglish` | Create | Nginx reverse proxy config tren VPS |
| 9 | `.github/workflows/deploy.yml` | Create | CI/CD pipeline |
| 10 | `docker-compose.staging.yml` | Create | Staging environment |
| 11 | `scripts/log-aggregator.sh` | Create | Log aggregation (cron 5 phut) |
| 12 | `scripts/health-check.sh` | Create | Health check (cron 1 phut) |
| 13 | `scripts/rollback.sh` | Create | Rollback script |
| 14 | `scripts/auto-backup.sh` | Create | Auto backup (cron daily) |

---

## 15. Cron Schedule Summary

| Script | Frequency | Purpose |
|--------|-----------|---------|
| `health-check.sh` | Every 1 minute | Check backend health, auto-restart if down |
| `log-aggregator.sh` | Every 5 minutes | Aggregate logs, detect errors, send alerts |
| `auto-backup.sh` | Every day at 3 AM | Backup database, code, configs |

---

## 16. Troubleshooting

### 16.1. Backend khong start

```bash
# Xem logs
docker compose logs backend

# Kiem tra database connection
docker compose exec backend curl -sf http://localhost:8080/actuator/health

# Kiem tra MySQL
docker compose logs mysql

# Rebuild backend
docker compose build backend
docker compose up -d backend
```

### 16.2. Frontend/Admin khong load

```bash
# Kiem tra Nginx
sudo nginx -t
sudo systemctl status nginx

# Kiem tra static files
ls -la /var/www/html/
ls -la /var/www/admin/

# Kiem tra Docker frontend
docker compose logs frontend
docker compose logs admin
```

### 16.3. SSL certificate loi

```bash
# Kiem tra certificate
sudo certbot certificates

# Renew manually
sudo certbot renew

# Reconfigure SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com -d admin.yourdomain.com
```

### 16.4. Disk full

```bash
# Xem disk usage
df -h

# Xem Docker usage
docker system df

# Xoa unused images
docker image prune -af

# Xoa old logs
find /var/log -name "*.log" -mtime +7 -delete

# Xoa old backups
find /var/backups -name "*.gz" -mtime +30 -delete
```

### 16.5. Memory full

```bash
# Xem memory usage
free -h

# Restart all containers
docker compose restart

# Xem top processes
htop
```

---

## 17. Common Commands Reference

```bash
# === Docker ===
docker compose up -d                    # Start all services
docker compose down                      # Stop all services
docker compose restart backend           # Restart backend
docker compose logs -f backend           # Follow backend logs
docker compose exec backend bash        # Shell into backend container
docker compose ps                        # Show container status
docker compose build --no-cache backend  # Rebuild backend

# === Nginx ===
sudo nginx -t                           # Test config
sudo systemctl reload nginx            # Reload config
sudo systemctl restart nginx           # Restart Nginx

# === SSL ===
sudo certbot renew                      # Renew SSL
sudo certbot certificates              # Show certificates

# === Logs ===
sudo tail -f /var/log/nginx/frontend_access.log
sudo tail -f /var/log/nginx/api_access.log
docker compose logs --tail 100 backend

# === System ===
htop                                    # System monitor
df -h                                   # Disk usage
free -h                                # Memory usage
uptime                                  # System load

# === Backup ===
/usr/local/bin/auto-backup.sh          # Manual backup
/usr/local/bin/rollback.sh latest      # Rollback
ls -la /var/backups/weblearnenglish/   # List backups
```

---

## 18. Deploy FrontEnd & Admin len Vercel

**Luu y:** Vercel chi host static files. Backend Spring Boot van phai chay tren VPS. Vercel se proxy `/api` requests len VPS.

### 18.1. Cai dat Vercel CLI

```bash
npm i -g vercel
cd FrontEnd
vercel login
```

### 18.2. Cau hinh Vercel cho FrontEnd

#### 18.2.1. Tao `FrontEnd/vercel.json`

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://api.yourdomain.com/api/$1"
    },
    {
      "source": "/ws/(.*)",
      "destination": "https://api.yourdomain.com/ws/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

#### 18.2.2. Cap nhat `vite.config.ts` cho FrontEnd

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    define: {
        global: 'window',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    base: '/',
    build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    utils: ['axios', 'zustand', 'i18next'],
                },
            },
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL || 'http://localhost:8080',
                changeOrigin: true,
            },
            '/ws': {
                target: process.env.VITE_API_URL || 'http://localhost:8080',
                ws: true,
                changeOrigin: true,
            },
        },
    },
})
```

#### 18.2.3. Deploy FrontEnd

**Qua Vercel CLI:**
```bash
cd FrontEnd
vercel
# Project name: engacademy-frontend
vercel --prod
```

**Qua GitHub:**
1. Vao https://vercel.com/new/import
2. Import `PhamMinhKha0710/EngAcademy-LMS`
3. Chon folder: `FrontEnd`
4. Project Name: `engacademy-frontend`
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**

### 18.3. Cau hinh Vercel cho Admin

#### 18.3.1. Tao `Admin/vercel.json`

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://api.yourdomain.com/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

#### 18.3.2. Cap nhat `vite.config.ts` cho Admin

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

#### 18.3.3. Deploy Admin

```bash
cd Admin
vercel
# Project name: engacademy-admin
vercel --prod
```

### 18.4. Cau hinh Custom Domain tren Vercel

1. Vao Project Settings > **Domains**
2. FrontEnd: Them `yourdomain.com` va `www.yourdomain.com`
3. Admin: Them `admin.yourdomain.com`
4. Vercel tu dong tao SSL certificate

### 18.5. Cap nhat Nginx tren VPS (chi proxy API)

```nginx
# /etc/nginx/sites-available/weblearnenglish
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    access_log /var/log/nginx/api_access.log;
    error_log /var/log/nginx/api_error.log;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        client_max_body_size 50M;
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        proxy_read_timeout 86400;
    }

    location /swagger-ui/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $http_host;
    }

    location /v3/api-docs {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $http_host;
    }
}
```

### 18.6. Cap nhat CORS tren Backend

```properties
# application-prod.properties
# Cho phep Vercel domains
application.cors.allowed-origins=https://engacademy-frontend.vercel.app,https://engacademy-admin.vercel.app,https://yourdomain.com,https://www.yourdomain.com,https://admin.yourdomain.com
```

Hoac trong SecurityConfig:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "https://*.vercel.app",
            "https://yourdomain.com",
            "https://*.yourdomain.com"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 18.7. Kien truc khi dung Vercel

```
Internet
   |
   +-- yourdomain.com ---------> Vercel (Frontend Static)
   |
   +-- admin.yourdomain.com ---> Vercel (Admin Static)
   |
   +-- api.yourdomain.com -----> VPS Nginx :443 ----> Backend :8080 ----> MySQL + Redis
```

### 18.8. Tom tat URL

| App | Vercel URL | Custom Domain |
|-----|-----------|---------------|
| FrontEnd | `engacademy-frontend.vercel.app` | `yourdomain.com` |
| Admin | `engacademy-admin.vercel.app` | `admin.yourdomain.com` |
| Backend | - | `api.yourdomain.com` |

---

## 19. Deploy Backend len Render

### 19.1. Muc luc

| Platform | Technology |
|----------|-----------|
| Backend | Render (Docker) |
| Database | MySQL tren Railway |
| Cache | Upstash Redis |
| Frontend | Vercel (da cau hinh o muc 18) |

### 19.2. Cai dat tren Render

**B1:** Tao repo moi tren Render (hoac connect tu GitHub)
- Vao https://dashboard.render.com/new?type=web
- Chon **Deploy from GitHub repo**
- Chon repo: `PhamMinhKha0710/EngAcademy-LMS`
- Branch: `dev` hoac `main`

**B2:** Cau hinh service

| Field | Value |
|-------|-------|
| Name | `engacademy-backend` |
| Region | Singapore |
| Runtime | Docker |
| Dockerfile Path | `BackEnd/Dockerfile` |
| Root Directory | `./` |
| Health Check | `/api/v1/auth/health` |
| Instance Type | Free (hoac Starter neu can) |

**B3:** Them Environment Variables trong Render Dashboard

Render se tu dong doc `render.yaml` neu co trong repo, nhung ban van can them thu cong cac bien sau trong Render Dashboard > Environment:

| Key | Value / Notes |
|-----|---------------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` |
| `APPLICATION_SECURITY_JWT_SECRET_KEY` | Render se tu tao (hoac ban nhap thu cong) |
| `APPLICATION_SECURITY_JWT_EXPIRATION` | `86400000` |
| `APPLICATION_SECURITY_JWT_REFRESH_TOKEN_EXPIRATION` | `604800000` |
| `APPLICATION_CORS_ALLOWED_ORIGINS` | `http://eng-academy-lms.vercel.app,https://eng-academy-admin.vercel.app` |
| `SPRING_DATA_REDIS_HOST` | `renewed-tadpole-87254.upstash.io` |
| `SPRING_DATA_REDIS_PORT` | `6379` |
| `SPRING_DATA_REDIS_USERNAME` | `default` |
| `SPRING_DATA_REDIS_PASSWORD` | *(Upstash token — tu them trong Render dashboard)* |
| `SPRING_DATA_REDIS_SSL` | `true` |
| `SPRING_MAIL_HOST` | `smtp.gmail.com` |
| `SPRING_MAIL_PORT` | `587` |
| `SPRING_MAIL_USERNAME` | `dinhminh4424@gmail.com` |
| `SPRING_MAIL_PASSWORD` | *(Gmail App Password — tu them trong Render dashboard)* |
| `RATE_LIMIT_MAX_ATTEMPTS` | `100` |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` |
| `RATE_LIMIT_ENABLED` | `true` |
| `DATABASE_URL` | *(xem muc 19.3)* |

**B4:** Deploy — click **Create Web Service**

Render se build Docker image, tai code tu `BackEnd/`, build Maven, va chay JAR.

### 19.3. Cau hinh DATABASE_URL (MySQL tren Railway)

Render khong dung bien `SPRING_DATASOURCE_URL` nhu Railway. Ban can them:

```
DATABASE_URL = mysql://<user>:<password>@<host>:<port>/<database>
```

Lay tu Railway Dashboard > MySQL service > **Connect** > Public URL. Chu y:
- Railway Internal hostname (`mysql.railway.internal`) **khong hoat dong** tren Render — phai dung **Public Host**.
- Format: `mysql://root:<password>@<public-host>:<port>/railway`

Vi du:
```
DATABASE_URL = mysql://root:ncxDhwRDzpBAtzfLaBzumhwnPGflObjS@top1.nearest.of.engacademy-db.internal:5432/railway
```

File `application-prod.properties` da duoc cau hinh de doc `DATABASE_URL` lam truoc, neu khong co se fallback ve `SPRING_DATASOURCE_URL`.

### 19.4. Cap nhat CORS sau khi deploy

Sau khi backend duoc deploy, Render se cung cap URL nhu:
```
https://engacademy-backend.onrender.com
```

Cap nhat `APPLICATION_CORS_ALLOWED_ORIGINS` trong Render Dashboard:
```
http://eng-academy-lms.vercel.app,https://eng-academy-admin.vercel.app,https://engacademy-backend.onrender.com
```

### 19.5. Tom tat cac file da tao/sua cho Render

| File | Hanh dong |
|------|-----------|
| `render.yaml` | Tao moi — chi Render biet Dockerfile nam o dau |
| `BackEnd/Dockerfile` | Sua — EXPOSE $PORT, ENTRYPOINT dung $PORT |
| `BackEnd/src/main/resources/application-prod.properties` | Sua — ho tro DATABASE_URL |

---

**End of Document**
