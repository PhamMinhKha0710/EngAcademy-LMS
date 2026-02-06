#!/bin/bash

# =============================================
# Git Workflow Script - English Learning Platform
# =============================================

echo "🚀 Starting Git Workflow..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Stash all changes
echo -e "${YELLOW}Step 1: Stashing all current changes...${NC}"
git add -A
git stash save "WIP: All uncommitted changes before feature branches"
echo -e "${GREEN}✓ Changes stashed${NC}"
echo ""

# 2. Create dev branch if not exists
echo -e "${YELLOW}Step 2: Setting up dev branch...${NC}"
git checkout main 2>/dev/null || git checkout master
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || echo "No remote to pull"
git checkout dev 2>/dev/null || git checkout -b dev
echo -e "${GREEN}✓ On dev branch${NC}"
echo ""

# 3. Feature 1: Backend API Architecture
echo -e "${YELLOW}Step 3: Creating feature/backend-api-architecture...${NC}"
git checkout -b feature/backend-api-architecture 2>/dev/null || git checkout feature/backend-api-architecture
git stash pop
git add BackEnd/src/main/java/com/englishlearn/config/OpenApiConfig.java
git add BackEnd/src/main/java/com/englishlearn/config/DataInitializer.java  
git add BackEnd/src/main/java/com/englishlearn/config/CorsConfig.java
git add BackEnd/src/main/java/com/englishlearn/exception/
git add BackEnd/src/main/java/com/englishlearn/dto/response/ApiResponse.java
git commit -m "feat(api): add global exception handling, OpenAPI config, and data initializer"
git stash save "Remaining changes after backend-api-architecture"
echo -e "${GREEN}✓ feature/backend-api-architecture created${NC}"
echo ""

# 4. Feature 2: User Authentication
echo -e "${YELLOW}Step 4: Creating feature/user-authentication...${NC}"
git checkout dev
git checkout -b feature/user-authentication 2>/dev/null || git checkout feature/user-authentication
git stash pop
git add BackEnd/src/main/java/com/englishlearn/controller/AuthController.java
git add BackEnd/src/main/java/com/englishlearn/controller/UserController.java
git add BackEnd/src/main/java/com/englishlearn/service/UserService.java
git add BackEnd/src/main/java/com/englishlearn/dto/response/UserResponse.java
git commit -m "feat(auth): add user controller and profile management endpoints"
git stash save "Remaining changes after user-authentication"
echo -e "${GREEN}✓ feature/user-authentication created${NC}"
echo ""

# 5. Feature 3: Lesson Management
echo -e "${YELLOW}Step 5: Creating feature/lesson-management...${NC}"
git checkout dev
git checkout -b feature/lesson-management 2>/dev/null || git checkout feature/lesson-management
git stash pop
git add BackEnd/src/main/java/com/englishlearn/controller/LessonController.java
git add BackEnd/src/main/java/com/englishlearn/controller/TopicController.java
git add BackEnd/src/main/java/com/englishlearn/service/LessonService.java
git add BackEnd/src/main/java/com/englishlearn/dto/request/LessonRequest.java
git add BackEnd/src/main/java/com/englishlearn/dto/response/LessonResponse.java
git add BackEnd/src/main/java/com/englishlearn/repository/LessonRepository.java
git add BackEnd/src/main/java/com/englishlearn/repository/TopicRepository.java
git add BackEnd/src/main/java/com/englishlearn/repository/RoleRepository.java
git add BackEnd/src/main/java/com/englishlearn/entity/Lesson.java
git commit -m "feat(lesson): add lesson CRUD with topic nested resources"
git stash save "Remaining changes after lesson-management"
echo -e "${GREEN}✓ feature/lesson-management created${NC}"
echo ""

# 6. Feature 4: Frontend Setup
echo -e "${YELLOW}Step 6: Creating feature/frontend-setup...${NC}"
git checkout dev
git checkout -b feature/frontend-setup 2>/dev/null || git checkout feature/frontend-setup
git stash pop
git add FrontEnd/
git commit -m "feat(frontend): setup React + Vite + TypeScript + Tailwind + Zustand

- Add project configuration (package.json, vite.config.ts, tailwind.config.js)
- Add layout components (Header, Footer, Sidebar, MainLayout)
- Add pages (Home, Login, Register, Dashboard)
- Add Zustand auth store with persistence
- Add API services (auth, lesson, user) with axios interceptors"
git stash save "Remaining changes after frontend-setup"
echo -e "${GREEN}✓ feature/frontend-setup created${NC}"
echo ""

# 7. Feature 5: Project Config
echo -e "${YELLOW}Step 7: Creating feature/project-config...${NC}"
git checkout dev
git checkout -b feature/project-config 2>/dev/null || git checkout feature/project-config
git stash pop
git add .gitignore
git add BackEnd/pom.xml
git add BackEnd/src/main/resources/application.properties
git add BackEnd/src/main/java/com/englishlearn/config/SecurityConfig.java
git commit -m "chore: update gitignore and configure MySQL database"
git stash save "Remaining changes after project-config"
echo -e "${GREEN}✓ feature/project-config created${NC}"
echo ""

# 8. Merge all to dev
echo -e "${YELLOW}Step 8: Merging all features to dev...${NC}"
git checkout dev
git merge feature/backend-api-architecture -m "Merge feature/backend-api-architecture into dev"
git merge feature/user-authentication -m "Merge feature/user-authentication into dev"
git merge feature/lesson-management -m "Merge feature/lesson-management into dev"
git merge feature/frontend-setup -m "Merge feature/frontend-setup into dev"
git merge feature/project-config -m "Merge feature/project-config into dev"
echo -e "${GREEN}✓ All features merged to dev${NC}"
echo ""

# 9. Apply remaining stash if any
echo -e "${YELLOW}Step 9: Applying remaining changes...${NC}"
git stash pop 2>/dev/null || echo "No remaining stashed changes"
git add -A
git status

echo ""
echo -e "${GREEN}✅ Git workflow completed!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review the branches: git branch -a"
echo "  2. Push to remote: git push origin dev --all"
echo "  3. Create Pull Requests on GitHub"
