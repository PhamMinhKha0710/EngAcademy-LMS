# SEC-001: OpenAPI and Swagger are publicly accessible

- Issue ID: SEC-001
- Severity: High
- Risk Level: High
- Module: API Documentation Exposure
- Tested At: 2026-05-21T09:06:17.860Z

## Steps to Reproduce
1. Do not send an Authorization header.
2. GET /v3/api-docs and /swagger-ui/index.html.

## Expected Result
API documentation is disabled or restricted outside trusted QA/admin networks.

## Actual Result
/v3/api-docs status=200; /swagger-ui/index.html status=200.

## Evidence
OpenAPI bytes observed: 1000; Swagger status: 200.

## Root Cause Hypothesis
SecurityConfig permits /swagger-ui/** and /v3/api-docs/** for all requests.

## Security Impact
Attackers can enumerate endpoints, schemas, request bodies, tags, and auth expectations.

## Production Impact
Increases exploit speed and endpoint discovery in production.

## DB Impact
Indirect; schema names and DTO fields can guide data tampering attacks.

## Concurrency Impact
Indirect; exposed workflows reveal race targets such as exam submit and SRS review.

## Logs
```text
{
  "openapi": {
    "name": "openapi_public",
    "method": "GET",
    "path": "/v3/api-docs",
    "status": 200,
    "ok": true,
    "ms": 1728,
    "responseSnippet": "{\"openapi\":\"[JWT_REDACTED]\",\"info\":{\"title\":\"English Learning Platform API\",\"description\":\"RESTful API cho hệ thống học tiếng Anh trực tuyến dành cho học sinh lớp 6\",\"contact\":{\"name\":\"English Learning Team\",\"url\":\"https://englishlearn.vn\",\"email\":\"support@englishlearn.vn\"},\"license\":{\"name\":\"MIT License\",\"url\":\"https://opensource.org/licenses/MIT\"},\"version\":\"[JWT_REDACTED]\"},\"servers\":[{\"url\":\"http://localhost:8080\",\"description\":\"Development Server\"},{\"url\":\"https://[JWT_REDACTED]\",\"description\":\"Production Server\"}],\"security\":[{\"Bearer [JWT_REDACTED]\":[]}],\"tags\":[{\"name\":\"Learning Path\",\"description\":\"Personalized learning path — ML-ready with rule-based fallback\"},{\"name\":\"Mistake Notebook\",\"description\":\"API quản lý sổ tay lỗi sai từ vựng\"},{\"name\":\"Dashboard\",\"description\":\"API cho bảng điều khiển thống kê\"},{\"name\":\"School Management\",\"description\":\"APIs for managing schools\"},{\"name\":\"SRS\",\"description\":\"Spaced Repetition System — SM-2 algorithm flashcard review\"},{\"name\":\"P",
    "error": null,
    "json": {
      "openapi": "[JWT_REDACTED]",
      "info": {
        "title": "English Learning Platform API",
        "description": "RESTful API cho hệ thống học tiếng Anh trực tuyến dành cho học sinh lớp 6",
        "contact": {
          "name": "English Learning Team",
          "url": "https://englishlearn.vn",
          "email": "support@englishlearn.vn"
        },
        "license": {
          "name": "MIT License",
          "url": "https://opensource.org/licenses/MIT"
        },
        "version": "[JWT_REDACTED]"
      },
      "servers": [
        {
          "url": "http://localhost:8080",
          "description": "Development Server"
        },
        {
          "url": "https://[JWT_REDACTED]",
          "description": "Production Server"
        }
      ],
      "security": [
        {
          "Bearer [JWT_REDACTED]": []
        }
      ],
      "tags": [
        {
          "name": "Learning Path",
          "description": "Personalized learning path — ML-ready with rule-based fallback"
        },
        {
          "name": "Mistake Notebook",
          "description": "API quản lý sổ tay lỗi sai từ vựng"
        },
        {
          "name": "Dashboard",
          "description": "API cho bảng điều khiển thống kê"
        },
        {
          "name": "School Management",
          "description": "APIs for managing schools"
        },
        {
          "name": "SRS",
          "description": "Spaced Repetition System — SM-2 algorithm flashcard review"
        },
        {
          "name": "Public",
          "description": "APIs công khai (không cần đăng nhập)"
        },
        {
          "name": "Events",
          "description": "Behavioral event tracking — batch REST API, Kafka-ready contract"
        },
        {
          "name": "Badges",
          "description": "API quản lý huy hiệu"
        },
        {
          "name": "ClassRoom Management",
          "description": "APIs for managing classrooms"
        },
        {
          "name": "Notifications",
          "description": "API quản lý thông báo"
        },
        {
          "name": "Leaderboard",
          "description": "API bảng xếp hạng"
        },
        {
          "name": "Vocabulary",
          "description": "APIs for vocabulary and flashcards"
        },
        {
          "name": "Learning Profile",
          "description": "APIs cá nhân hoá học tập — onboarding, level theo skill, goals"
        },
        {
          "name": "Topics",
          "description": "APIs for topic-based vocabulary learning"
        },
        {
          "name": "Placement",
          "description": "Adaptive placement test — xác định CEFR level theo 4 kỹ năng"
        },
        {
          "name": "Lessons",
          "description": "API quản lý bài học"
        },
        {
          "name": "Question Management",
          "description": "APIs for managing questions"
        },
        {
          "name": "LLM",
          "description": "LLM-powered writing feedback — Phase 4"
        },
        {
          "name": "Exam Management",
          "description": "APIs for managing exams"
        },
        {
          "name": "Test Notifications",
          "description": "API để test thông báo real-time"
        },
        {
          "name": "Progress",
          "description": "APIs for tracking learning progress"
        },
        {
          "name": "Authentication",
          "description": "API xác thực người dùng"
        },
        {
          "name": "Daily Quests",
          "description": "API quản lý nhiệm vụ hàng ngày"
        },
        {
          "name": "Users",
          "description": "API quản lý người dùng"
        },
        {
          "name": "Recommendations",
          "description": "Rule-based daily recommendations + nightly weakness analysis"
        }
      ],
      "paths": {
        "/api/v1/vocabulary/{id}": {
          "get": {
            "tags": [
              "Vocabulary"
            ],
            "summary": "Get vocabulary by ID",
            "operationId": "getVocabularyById",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVocabularyResponse"
                    }
                  }
                }
              }
            }
          },
          "put": {
            "tags": [
              "Vocabulary"
            ],
            "summary": "Cập nhật từ vựng",
            "operationId": "updateVocabulary",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/VocabularyRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVocabularyResponse"
                    }
                  }
                }
              }
            }
          },
          "delete": {
            "tags": [
              "Vocabulary"
            ],
            "summary": "Xóa từ vựng",
            "operationId": "deleteVocabulary",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/users/{id}": {
          "get": {
            "tags": [
              "Users"
            ],
            "summary": "Lấy thông tin người dùng theo ID",
            "operationId": "getById",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseUserResponse"
                    }
                  }
                }
              }
            }
          },
          "put": {
            "tags": [
              "Users"
            ],
            "summary": "Cập nhật người dùng theo ID",
            "operationId": "updateUser",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UpdateUserRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseUserResponse"
                    }
                  }
                }
              }
            }
          },
          "delete": {
            "tags": [
              "Users"
            ],
            "summary": "Xóa người dùng",
            "operationId": "deleteUser",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/users/me/settings": {
          "get": {
            "tags": [
              "Users"
            ],
            "summary": "Lấy cài đặt cá nhân cho trang settings",
            "operationId": "getMySettings",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseUserSettingsResponse"
                    }
                  }
                }
              }
            }
          },
          "put": {
            "tags": [
              "Users"
            ],
            "summary": "Cập nhật cài đặt cá nhân cho trang settings",
            "operationId": "updateMySettings",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UpdateUserSettingsRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseUserSettingsResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/schools/{id}": {
          "get": {
            "tags": [
              "School Management"
            ],
            "summary": "Get school by ID",
            "operationId": "getSchoolById",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseSchoolResponse"
                    }
                  }
                }
              }
            }
          },
          "put": {
            "tags": [
              "School Management"
            ],
            "summary": "Update a school",
            "operationId": "updateSchool",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/SchoolRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseSchoolResponse"
                    }
                  }
                }
              }
            }
          },
          "delete": {
            "tags": [
              "School Management"
            ],
            "summary": "Soft delete a school",
            "description": "Admin only",
            "operationId": "deleteSchool",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/questions/{id}": {
          "get": {
            "tags": [
              "Question Management"
            ],
            "summary": "Get question by ID",
            "operationId": "getQuestionById",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseQuestionResponse"
                    }
                  }
                }
              }
            }
          },
          "put": {
            "tags": [
              "Question Management"
            ],
            "summary": "Update a question",
            "operationId": "updateQuestion",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/QuestionRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseQuestionResponse"
                    }
                  }
                }
              }
            }
          },
          "delete": {
            "tags": [
              "Question Management"
            ],
            "summary": "Delete a question",
            "operationId": "deleteQuestion",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/notifications/me/{id}/read": {
          "put": {
            "tags": [
              "Notifications"
            ],
            "summary": "Đánh dấu thông báo là đã đọc của người dùng hiện tại",
            "operationId": "markMyNotificationAsRead",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/notifications/me/read-all": {
          "put": {
            "tags": [
              "Notifications"
            ],
            "summary": "Đánh dấu tất cả thông báo của người dùng hiện tại là đã đọc",
            "operationId": "markAllAsReadMe",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/lessons/{id}": {
          "get": {
            "tags": [
              "Lessons"
            ],
            "summary": "Lấy bài học theo ID",
            "operationId": "getById_1",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "description": "ID của bài học",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseLessonResponse"
                    }
                  }
                }
              }
            }
          },
          "put": {
            "tags": [
              "Lessons"
            ],
            "summary": "Cập nhật bài học",
            "operationId": "update",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/LessonRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseLessonResponse"
                    }
                  }
                }
              }
            }
          },
          "delete": {
            "tags": [
              "Lessons"
            ],
            "summary": "Xóa bài học",
            "operationId": "delete",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/learning-profile/me": {
          "get": {
            "tags": [
              "Learning Profile"
            ],
            "summary": "Lấy profile học tập của user hiện tại",
            "operationId": "getMyProfile",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseLearningProfileResponse"
                    }
                  }
                }
              }
            }
          },
          "put": {
            "tags": [
              "Learning Profile"
            ],
            "summary": "Cập nhật profile học tập (goals, daily target, topics)",
            "operationId": "updateProfile",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UpdateLearningProfileRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseLearningProfileResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/exams/{id}": {
          "get": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Get exam by ID (teacher/admin view - shows correct answers)",
            "operationId": "getExamById",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseExamResponse"
                    }
                  }
                }
              }
            }
          },
          "put": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Update an exam",
            "operationId": "updateExam",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ExamRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseExamResponse"
                    }
                  }
                }
              }
            }
          },
          "delete": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Delete an exam",
            "operationId": "deleteExam",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/classes/{id}": {
          "get": {
            "tags": [
              "ClassRoom Management"
            ],
            "summary": "Get classroom by ID",
            "operationId": "getClassRoomById",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseClassRoomResponse"
                    }
                  }
                }
              }
            }
          },
          "put": {
            "tags": [
              "ClassRoom Management"
            ],
            "summary": "Update a classroom",
            "operationId": "updateClassRoom",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ClassRoomRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseClassRoomResponse"
                    }
                  }
                }
              }
            }
          },
          "delete": {
            "tags": [
              "ClassRoom Management"
            ],
            "summary": "Soft delete a classroom",
            "operationId": "deleteClassRoom",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/vocabulary": {
          "post": {
            "tags": [
              "Vocabulary"
            ],
            "summary": "Tạo từ vựng mới",
            "operationId": "createVocabulary",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/VocabularyRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVocabularyResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/vocabulary/review": {
          "post": {
            "tags": [
              "Vocabulary"
            ],
            "summary": "Review a vocabulary word (correct/wrong)",
            "operationId": "reviewWord",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "additionalProperties": {
                      "type": "object"
                    }
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseMapStringObject"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/users": {
          "get": {
            "tags": [
              "Users"
            ],
            "summary": "Lấy danh sách người dùng (phân trang)",
            "operationId": "getAll",
            "parameters": [
              {
                "name": "pageable",
                "in": "query",
                "required": true,
                "schema": {
                  "$ref": "#/components/schemas/Pageable"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponsePageUserResponse"
                    }
                  }
                }
              }
            }
          },
          "post": {
            "tags": [
              "Users"
            ],
            "summary": "Tạo người dùng mới",
            "operationId": "createUser",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CreateUserRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseUserResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/users/{id}/coins": {
          "post": {
            "tags": [
              "Users"
            ],
            "summary": "Thêm xu cho người dùng",
            "operationId": "addCoins",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "amount",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int32"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/test-notifications/send/{userId}": {
          "post": {
            "tags": [
              "Test Notifications"
            ],
            "summary": "Gửi thông báo test cho user cụ thể (chỉ ADMIN hoặc SYSTEM)",
            "operationId": "sendTest",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "title",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "string"
                }
              },
              {
                "name": "message",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseString"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/srs/review": {
          "post": {
            "tags": [
              "SRS"
            ],
            "summary": "Submit review với quality 0–5 — SM-2 cập nhật schedule tự động",
            "operationId": "submitReview",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/SrsReviewRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseSrsDueResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/schools": {
          "get": {
            "tags": [
              "School Management"
            ],
            "summary": "Get all schools",
            "description": "Retrieve all schools (Admin/School only)",
            "operationId": "getAllSchools",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListSchoolResponse"
                    }
                  }
                }
              }
            }
          },
          "post": {
            "tags": [
              "School Management"
            ],
            "summary": "Create a new school",
            "description": "Admin only",
            "operationId": "createSchool",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/SchoolRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseSchoolResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/quests": {
          "post": {
            "tags": [
              "Daily Quests"
            ],
            "summary": "Tạo quest mới với tasks tùy chỉnh",
            "operationId": "createQuest",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/DailyQuestRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseDailyQuestResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/quests/complete": {
          "post": {
            "tags": [
              "Daily Quests"
            ],
            "summary": "Hoàn thành quest hôm nay",
            "operationId": "completeQuest",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseDailyQuestResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/questions": {
          "get": {
            "tags": [
              "Question Management"
            ],
            "summary": "Get all questions",
            "operationId": "getAllQuestions",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListQuestionResponse"
                    }
                  }
                }
              }
            }
          },
          "post": {
            "tags": [
              "Question Management"
            ],
            "summary": "Create a new question",
            "operationId": "createQuestion",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/QuestionRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseQuestionResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/progress/user/{userId}/lesson/{lessonId}": {
          "get": {
            "tags": [
              "Progress"
            ],
            "summary": "Lấy tiến độ bài học cụ thể của user (Teacher/Admin)",
            "operationId": "getProgressForLesson",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "lessonId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseProgressResponse"
                    }
                  }
                }
              }
            }
          },
          "post": {
            "tags": [
              "Progress"
            ],
            "summary": "Cập nhật tiến độ bài học cho user (Teacher/Admin)",
            "operationId": "updateProgress",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "lessonId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "percentage",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int32"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseProgressResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/progress/user/{userId}/lesson/{lessonId}/complete": {
          "post": {
            "tags": [
              "Progress"
            ],
            "summary": "Đánh dấu bài học hoàn thành cho user (Teacher/Admin)",
            "operationId": "completeLesson",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "lessonId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseProgressResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/progress/me/lesson/{lessonId}": {
          "get": {
            "tags": [
              "Progress"
            ],
            "summary": "Lấy tiến độ bài học cụ thể của user hiện tại",
            "operationId": "getMyProgressForLesson",
            "parameters": [
              {
                "name": "lessonId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseProgressResponse"
                    }
                  }
                }
              }
            }
          },
          "post": {
            "tags": [
              "Progress"
            ],
            "summary": "Cập nhật tiến độ bài học cho user hiện tại",
            "operationId": "updateMyProgress",
            "parameters": [
              {
                "name": "lessonId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "percentage",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int32"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseProgressResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/progress/me/lesson/{lessonId}/complete": {
          "post": {
            "tags": [
              "Progress"
            ],
            "summary": "Đánh dấu bài học hoàn thành cho user hiện tại",
            "operationId": "completeMyLesson",
            "parameters": [
              {
                "name": "lessonId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseProgressResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/placement/session": {
          "post": {
            "tags": [
              "Placement"
            ],
            "summary": "Tạo placement session mới, trả về sessionId",
            "operationId": "createSession",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponsePlacementSessionResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/placement/answer": {
          "post": {
            "tags": [
              "Placement"
            ],
            "summary": "Submit đáp án — trả kết quả cuối nếu hoàn thành",
            "operationId": "submitAnswer",
            "parameters": [
              {
                "name": "sessionId",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "string"
                }
              }
            ],
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PlacementAnswerRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponsePlacementAnswerAccepted"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/notifications/send/{userId}": {
          "post": {
            "tags": [
              "Notifications"
            ],
            "summary": "Gửi thông báo trực tiếp cho một người dùng",
            "operationId": "sendNotification",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "title",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "string"
                }
              },
              {
                "name": "message",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "string"
                }
              },
              {
                "name": "imageUrl",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/notifications/broadcast": {
          "post": {
            "tags": [
              "Notifications"
            ],
            "summary": "Gửi thông báo đến một nhóm người dùng (Toàn bộ, Vai trò, Trường học, Lớp học)",
            "operationId": "broadcastNotification",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/BroadcastNotificationRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/mistakes": {
          "post": {
            "tags": [
              "Mistake Notebook"
            ],
            "summary": "Thêm lỗi sai vào sổ tay (tự động gắn userId của người dùng hiện tại)",
            "operationId": "addMistake",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/MistakeNotebookRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseMistakeNotebookDTO"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/llm/writing-feedback": {
          "post": {
            "tags": [
              "LLM"
            ],
            "summary": "Sinh personalized feedback cho bài viết dựa trên CEFR level + weak areas của user",
            "operationId": "getWritingFeedback",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/WritingFeedbackRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseString"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/lessons": {
          "get": {
            "tags": [
              "Lessons"
            ],
            "summary": "Lọc bài học theo độ khó",
            "operationId": "getAll_1_1_1_1_1",
            "parameters": [
              {
                "name": "pageable",
                "in": "query",
                "required": true,
                "schema": {
                  "$ref": "#/components/schemas/Pageable"
                }
              },
              {
                "name": "topicId",
                "in": "query",
                "description": "ID của chủ đề",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "difficultyLevel",
                "in": "query",
                "description": "Độ khó (1-5)",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int32"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponsePageLessonResponse"
                    }
                  }
                }
              }
            }
          },
          "post": {
            "tags": [
              "Lessons"
            ],
            "summary": "Tạo bài học mới",
            "operationId": "create",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/LessonRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseLessonResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/learning-profile/onboarding": {
          "post": {
            "tags": [
              "Learning Profile"
            ],
            "summary": "Hoàn tất onboarding: thiết lập goals + time commitment + topics",
            "operationId": "completeOnboarding",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CompleteOnboardingRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseLearningProfileResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/exams": {
          "get": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Lấy danh sách bài thi (Admin lấy hết, School lấy theo trường)",
            "operationId": "getAll_1",
            "parameters": [
              {
                "name": "pageable",
                "in": "query",
                "required": true,
                "schema": {
                  "$ref": "#/components/schemas/Pageable"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponsePageExamResponse"
                    }
                  }
                }
              }
            }
          },
          "post": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Create a new exam",
            "operationId": "createExam",
            "parameters": [
              {
                "name": "teacherId",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ExamRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseExamResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/exams/{id}/publish": {
          "post": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Publish an exam",
            "operationId": "publishExam",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseExamResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/exams/{id}/publish-scores": {
          "post": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Publish exam scores for students",
            "operationId": "publishScores",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseExamResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/exams/{id}/close": {
          "post": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Close an exam",
            "operationId": "closeExam",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseExamResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/exams/{examId}/submit-anticheat": {
          "post": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Nộp bài thi (với kiểm tra thời gian và anti-cheat)",
            "operationId": "submitExamWithAntiCheat",
            "parameters": [
              {
                "name": "examId",
                "in": "path",
                "description": "ID của bài thi",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ExamSubmitDTO"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseExamResultDTO"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/exams/{examId}/start": {
          "post": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Bắt đầu làm bài thi (có shuffle câu hỏi/đáp án, tạo phiên thi)",
            "operationId": "startExam",
            "parameters": [
              {
                "name": "examId",
                "in": "path",
                "description": "ID của bài thi",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "studentId",
                "in": "query",
                "description": "ID của sinh viên",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseExamTakeDTO"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/exams/{examId}/anti-cheat-event": {
          "post": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Ghi nhận sự kiện chống gian lận (tab switch, copy/paste, v.v.)",
            "operationId": "logAntiCheatEvent",
            "parameters": [
              {
                "name": "examId",
                "in": "path",
                "description": "ID của bài thi",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/AntiCheatEventDTO"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/exams/submit": {
          "post": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Submit exam answers",
            "operationId": "submitExam",
            "parameters": [
              {
                "name": "studentId",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/SubmitExamRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseExamResultResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/events/batch": {
          "post": {
            "tags": [
              "Events"
            ],
            "summary": "Track batch of behavioral events (Kafka-ready contract)",
            "operationId": "trackBatch",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/BatchEventRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseMapStringObject"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/classes": {
          "get": {
            "tags": [
              "ClassRoom Management"
            ],
            "summary": "Get all classrooms",
            "operationId": "getAllClassRooms",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListClassRoomResponse"
                    }
                  }
                }
              }
            }
          },
          "post": {
            "tags": [
              "ClassRoom Management"
            ],
            "summary": "Create a new classroom",
            "operationId": "createClassRoom",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ClassRoomRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseClassRoomResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/classes/{classId}/teacher/{teacherId}": {
          "post": {
            "tags": [
              "ClassRoom Management"
            ],
            "summary": "Assign a teacher to classroom",
            "operationId": "assignTeacher",
            "parameters": [
              {
                "name": "classId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "teacherId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/classes/{classId}/students/{studentId}": {
          "post": {
            "tags": [
              "ClassRoom Management"
            ],
            "summary": "Add a student to classroom",
            "operationId": "addStudentToClass",
            "parameters": [
              {
                "name": "classId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "studentId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          },
          "delete": {
            "tags": [
              "ClassRoom Management"
            ],
            "summary": "Remove a student from classroom",
            "operationId": "removeStudentFromClass",
            "parameters": [
              {
                "name": "classId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "studentId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/badges": {
          "post": {
            "tags": [
              "Badges"
            ],
            "summary": "Tạo huy hiệu mới (Admin)",
            "operationId": "createBadge",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/BadgeRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseBadgeResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/badges/{userId}/check-achievements": {
          "post": {
            "tags": [
              "Badges"
            ],
            "summary": "Kiểm tra và cấp huy hiệu achievements (Admin/School/System)",
            "operationId": "checkAndAwardAchievements",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListBadgeResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/badges/{userId}/award/{badgeName}": {
          "post": {
            "tags": [
              "Badges"
            ],
            "summary": "Cấp huy hiệu cho user (Admin/School/Teacher)",
            "operationId": "awardBadge",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "badgeName",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "string"
                }
              },
              {
                "name": "description",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "string"
                }
              },
              {
                "name": "iconUrl",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseBadgeResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/badges/me/check": {
          "post": {
            "tags": [
              "Badges"
            ],
            "summary": "Kiểm tra và trao badge cho chính mình, trả về badge mới đạt được",
            "operationId": "checkAndAwardBadgesForMe",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseCheckBadgeResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/auth/reset-password": {
          "post": {
            "tags": [
              "Authentication"
            ],
            "summary": "Reset mật khẩu bằng mã OTP",
            "operationId": "resetPassword",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ResetPasswordRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/auth/register": {
          "post": {
            "tags": [
              "Authentication"
            ],
            "summary": "Đăng ký tài khoản mới",
            "operationId": "register",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/RegisterRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseAuthResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/auth/refresh-token": {
          "post": {
            "tags": [
              "Authentication"
            ],
            "summary": "Làm mới access token bằng refresh token",
            "operationId": "refreshToken",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "additionalProperties": {
                      "type": "string"
                    }
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseAuthResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/auth/logout": {
          "post": {
            "tags": [
              "Authentication"
            ],
            "summary": "Đăng xuất",
            "operationId": "logout",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/auth/login": {
          "post": {
            "tags": [
              "Authentication"
            ],
            "summary": "Đăng nhập",
            "operationId": "login",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/LoginRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseAuthResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/auth/google": {
          "post": {
            "tags": [
              "Authentication"
            ],
            "summary": "Đăng nhập bằng Google",
            "operationId": "googleLogin",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GoogleLoginRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseAuthResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/auth/forgot-password": {
          "post": {
            "tags": [
              "Authentication"
            ],
            "summary": "Quên mật khẩu - Gửi OTP về email",
            "operationId": "forgotPassword",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ForgotPasswordRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/users/me": {
          "get": {
            "tags": [
              "Users"
            ],
            "summary": "Lấy thông tin người dùng hiện tại",
            "operationId": "getCurrentUser",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseUserResponse"
                    }
                  }
                }
              }
            }
          },
          "patch": {
            "tags": [
              "Users"
            ],
            "summary": "Cập nhật thông tin cá nhân",
            "operationId": "updateProfile_1",
            "parameters": [
              {
                "name": "fullName",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "string"
                }
              },
              {
                "name": "avatarUrl",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseUserResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/users/me/password": {
          "patch": {
            "tags": [
              "Users"
            ],
            "summary": "Đổi mật khẩu",
            "operationId": "changePassword",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ChangePasswordRequest"
                  }
                }
              },
              "required": true
            },
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/quests/tasks/{taskId}": {
          "patch": {
            "tags": [
              "Daily Quests"
            ],
            "summary": "Cập nhật tiến độ hoàn thành của task",
            "operationId": "updateTaskProgress",
            "parameters": [
              {
                "name": "taskId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "progress",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int32"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseDailyQuestResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/vocabulary/topic/{topicId}": {
          "get": {
            "tags": [
              "Vocabulary"
            ],
            "summary": "Get vocabulary by topic",
            "operationId": "getVocabularyByTopic",
            "parameters": [
              {
                "name": "topicId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListVocabularyResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/vocabulary/search": {
          "get": {
            "tags": [
              "Vocabulary"
            ],
            "summary": "Search vocabulary",
            "operationId": "searchVocabulary",
            "parameters": [
              {
                "name": "keyword",
                "in": "query",
                "required": true,
                "schema": {
                  "maxLength": 100,
                  "minLength": 1,
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListVocabularyResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/vocabulary/lesson/{lessonId}": {
          "get": {
            "tags": [
              "Vocabulary"
            ],
            "summary": "Get vocabulary by lesson",
            "operationId": "getVocabularyByLesson",
            "parameters": [
              {
                "name": "lessonId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListVocabularyResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/vocabulary/lesson/{lessonId}/paged": {
          "get": {
            "tags": [
              "Vocabulary"
            ],
            "summary": "Get vocabulary by lesson with pagination",
            "operationId": "getVocabularyByLessonPaged",
            "parameters": [
              {
                "name": "lessonId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "pageable",
                "in": "query",
                "required": true,
                "schema": {
                  "$ref": "#/components/schemas/Pageable"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponsePageVocabularyResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/vocabulary/learned": {
          "get": {
            "tags": [
              "Vocabulary"
            ],
            "summary": "Get all mastered vocabulary for current user",
            "operationId": "getLearnedWords",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListVocabularyResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/vocabulary/learned/count": {
          "get": {
            "tags": [
              "Vocabulary"
            ],
            "summary": "Get mastered vocabulary count for current user",
            "operationId": "getLearnedCount",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseLong"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/vocabulary/flashcards/{lessonId}": {
          "get": {
            "tags": [
              "Vocabulary"
            ],
            "summary": "Get flashcards for lesson",
            "operationId": "getFlashcards",
            "parameters": [
              {
                "name": "lessonId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "count",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "integer",
                  "format": "int32",
                  "default": 10
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListVocabularyResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/vocabulary/flashcards/random": {
          "get": {
            "tags": [
              "Vocabulary"
            ],
            "summary": "Get random flashcards",
            "operationId": "getRandomFlashcards",
            "parameters": [
              {
                "name": "count",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "integer",
                  "format": "int32",
                  "default": 10
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListVocabularyResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/users/teachers": {
          "get": {
            "tags": [
              "Users"
            ],
            "summary": "Tìm kiếm giáo viên",
            "operationId": "searchTeachers",
            "parameters": [
              {
                "name": "keyword",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "string",
                  "default": ""
                }
              },
              {
                "name": "pageable",
                "in": "query",
                "required": true,
                "schema": {
                  "$ref": "#/components/schemas/Pageable"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponsePageUserResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/users/students": {
          "get": {
            "tags": [
              "Users"
            ],
            "summary": "Tìm kiếm học sinh",
            "operationId": "searchStudents",
            "parameters": [
              {
                "name": "keyword",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "string",
                  "default": ""
                }
              },
              {
                "name": "pageable",
                "in": "query",
                "required": true,
                "schema": {
                  "$ref": "#/components/schemas/Pageable"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponsePageUserResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/users/stats": {
          "get": {
            "tags": [
              "Users"
            ],
            "summary": "Lấy thống kê người dùng (Admin only)",
            "operationId": "getUserStats",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseAdminUserStatsResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/users/me/audit-logs": {
          "get": {
            "tags": [
              "Users"
            ],
            "summary": "Lấy nhật ký hoạt động của mình",
            "operationId": "getMyAuditLogs",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListAuditLogResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/topics": {
          "get": {
            "tags": [
              "Topics"
            ],
            "summary": "Lấy tất cả chủ đề với tiến độ học tập của user hiện tại",
            "operationId": "getTopicsWithProgress",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListMapStringObject"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/topics/{topicId}/lessons": {
          "get": {
            "tags": [
              "Topics"
            ],
            "summary": "Lấy danh sách bài học theo chủ đề",
            "operationId": "getLessonsByTopic",
            "parameters": [
              {
                "name": "topicId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListLessonResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/topics/{topicId}/learn": {
          "get": {
            "tags": [
              "Topics"
            ],
            "summary": "Lấy tối đa 20 từ chưa thành thạo cho một chủ đề của user hiện tại",
            "operationId": "getWordsToLearn",
            "parameters": [
              {
                "name": "topicId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListVocabularyResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/srs/due-today": {
          "get": {
            "tags": [
              "SRS"
            ],
            "summary": "Lấy danh sách flashcard cần ôn hôm nay (đã sort theo overdue + EF)",
            "operationId": "getDueToday",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseSrsDueResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/schools/search": {
          "get": {
            "tags": [
              "School Management"
            ],
            "summary": "Search schools by name",
            "operationId": "searchSchools",
            "parameters": [
              {
                "name": "name",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListSchoolResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/schools/active": {
          "get": {
            "tags": [
              "School Management"
            ],
            "summary": "Get active schools with pagination",
            "operationId": "getActiveSchools",
            "parameters": [
              {
                "name": "pageable",
                "in": "query",
                "required": true,
                "schema": {
                  "$ref": "#/components/schemas/Pageable"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponsePageSchoolResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/recommendations/daily": {
          "get": {
            "tags": [
              "Recommendations"
            ],
            "summary": "Lấy bài học được cá nhân hoá cho hôm nay — ưu tiên weak skills → topic → level",
            "operationId": "getDailyRecommendations",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseRecommendationResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/quests/today": {
          "get": {
            "tags": [
              "Daily Quests"
            ],
            "summary": "Lấy quest của hôm nay",
            "operationId": "getTodayQuest",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseDailyQuestResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/quests/history": {
          "get": {
            "tags": [
              "Daily Quests"
            ],
            "summary": "Lấy lịch sử quests",
            "operationId": "getQuestHistory",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListDailyQuestResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/questions/type/{type}": {
          "get": {
            "tags": [
              "Question Management"
            ],
            "summary": "Get questions by type",
            "operationId": "getQuestionsByType",
            "parameters": [
              {
                "name": "type",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "string"
                }
              },
              {
                "name": "pageable",
                "in": "query",
                "required": true,
                "schema": {
                  "$ref": "#/components/schemas/Pageable"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponsePageQuestionResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/questions/lesson/{lessonId}": {
          "get": {
            "tags": [
              "Question Management"
            ],
            "summary": "Get questions by lesson",
            "operationId": "getQuestionsByLesson",
            "parameters": [
              {
                "name": "lessonId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListQuestionResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/public/stats": {
          "get": {
            "tags": [
              "Public"
            ],
            "summary": "Thống kê tổng quan (học sinh, bài học, từ vựng)",
            "operationId": "getPublicStats",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseMapStringLong"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/progress/user/{userId}": {
          "get": {
            "tags": [
              "Progress"
            ],
            "summary": "Lấy tất cả tiến độ học tập của user (Teacher/Admin)",
            "operationId": "getProgressByUser",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListProgressResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/progress/user/{userId}/stats": {
          "get": {
            "tags": [
              "Progress"
            ],
            "summary": "Lấy thống kê học tập của user (Teacher/Admin)",
            "operationId": "getUserStats_1",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseMapStringObject"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/progress/user/{userId}/in-progress": {
          "get": {
            "tags": [
              "Progress"
            ],
            "summary": "Lấy các bài học đang học của user (Teacher/Admin)",
            "operationId": "getInProgressLessons",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListProgressResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/progress/user/{userId}/completed": {
          "get": {
            "tags": [
              "Progress"
            ],
            "summary": "Lấy các bài học đã hoàn thành của user (Teacher/Admin)",
            "operationId": "getCompletedLessons",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListProgressResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/progress/me": {
          "get": {
            "tags": [
              "Progress"
            ],
            "summary": "Lấy tất cả tiến độ học tập của user hiện tại",
            "operationId": "getMyProgress",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListProgressResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/progress/me/stats": {
          "get": {
            "tags": [
              "Progress"
            ],
            "summary": "Lấy thống kê học tập của user hiện tại",
            "operationId": "getMyStats",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseMapStringObject"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/progress/me/in-progress": {
          "get": {
            "tags": [
              "Progress"
            ],
            "summary": "Lấy các bài học đang học của user hiện tại",
            "operationId": "getMyInProgressLessons",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListProgressResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/progress/me/completed": {
          "get": {
            "tags": [
              "Progress"
            ],
            "summary": "Lấy các bài học đã hoàn thành của user hiện tại",
            "operationId": "getMyCompletedLessons",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListProgressResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/placement/result": {
          "get": {
            "tags": [
              "Placement"
            ],
            "summary": "Lấy kết quả placement (sau khi hoàn thành)",
            "operationId": "getResult",
            "parameters": [
              {
                "name": "sessionId",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponsePlacementResultResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/placement/question": {
          "get": {
            "tags": [
              "Placement"
            ],
            "summary": "Lấy câu hỏi tiếp theo (adaptive)",
            "operationId": "getNextQuestion",
            "parameters": [
              {
                "name": "sessionId",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponsePlacementQuestionResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/notifications/me": {
          "get": {
            "tags": [
              "Notifications"
            ],
            "summary": "Lấy danh sách thông báo của người dùng hiện tại",
            "operationId": "getMyNotifications",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListNotificationResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/notifications/me/unread-count": {
          "get": {
            "tags": [
              "Notifications"
            ],
            "summary": "Lấy số lượng thông báo chưa đọc của người dùng hiện tại",
            "operationId": "getMyUnreadCount",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseLong"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/mistakes/user/{userId}": {
          "get": {
            "tags": [
              "Mistake Notebook"
            ],
            "summary": "Lấy danh sách lỗi sai của người dùng (Teacher/Admin)",
            "operationId": "getMistakesByUser",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "description": "ID của người dùng",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListMistakeNotebookDTO"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/mistakes/user/{userId}/top": {
          "get": {
            "tags": [
              "Mistake Notebook"
            ],
            "summary": "Lấy top 10 lỗi sai nhiều nhất của người dùng (Teacher/Admin)",
            "operationId": "getTopMistakes",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "description": "ID của người dùng",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListMistakeNotebookDTO"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/mistakes/user/{userId}/count": {
          "get": {
            "tags": [
              "Mistake Notebook"
            ],
            "summary": "Đếm số lỗi sai của người dùng (Teacher/Admin)",
            "operationId": "countMistakes",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "description": "ID của người dùng",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseLong"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/mistakes/me": {
          "get": {
            "tags": [
              "Mistake Notebook"
            ],
            "summary": "Lấy danh sách lỗi sai của chính mình",
            "operationId": "getMyMistakes",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListMistakeNotebookDTO"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/mistakes/me/top": {
          "get": {
            "tags": [
              "Mistake Notebook"
            ],
            "summary": "Lấy top 10 lỗi sai nhiều nhất của chính mình",
            "operationId": "getMyTopMistakes",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListMistakeNotebookDTO"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/mistakes/me/count": {
          "get": {
            "tags": [
              "Mistake Notebook"
            ],
            "summary": "Đếm số lỗi sai của chính mình",
            "operationId": "countMyMistakes",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseLong"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/learning-profile/status": {
          "get": {
            "tags": [
              "Learning Profile"
            ],
            "summary": "Kiểm tra đã hoàn thành onboarding chưa",
            "operationId": "getOnboardingStatus",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseLearningProfileStatusResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/learning-path/recommended": {
          "get": {
            "tags": [
              "Learning Path"
            ],
            "summary": "Lấy lộ trình học cá nhân — gọi ML service hoặc fallback rule-based",
            "operationId": "getRecommendedPath",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseLearningPathResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/leaderboard/users/{userId}": {
          "get": {
            "tags": [
              "Leaderboard"
            ],
            "summary": "Lấy vị trí (rank) của user theo ID",
            "operationId": "getUserRank",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "schoolId",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseLeaderboardResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/leaderboard/top": {
          "get": {
            "tags": [
              "Leaderboard"
            ],
            "summary": "Lấy top users theo coins",
            "operationId": "getTopUsers",
            "parameters": [
              {
                "name": "schoolId",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "limit",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "integer",
                  "format": "int32",
                  "default": 10
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListLeaderboardResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/leaderboard/streak": {
          "get": {
            "tags": [
              "Leaderboard"
            ],
            "summary": "Lấy bảng xếp hạng theo streak",
            "operationId": "getLeaderboardByStreak",
            "parameters": [
              {
                "name": "schoolId",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "limit",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "integer",
                  "format": "int32",
                  "default": 100
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListLeaderboardResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/leaderboard/me": {
          "get": {
            "tags": [
              "Leaderboard"
            ],
            "summary": "Lấy vị trí (rank) của user hiện tại",
            "operationId": "getMyRank",
            "parameters": [
              {
                "name": "schoolId",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseLeaderboardResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/leaderboard/global": {
          "get": {
            "tags": [
              "Leaderboard"
            ],
            "summary": "Lấy bảng xếp hạng tổng hợp (coins + streak)",
            "operationId": "getGlobalLeaderboard",
            "parameters": [
              {
                "name": "schoolId",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "limit",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "integer",
                  "format": "int32",
                  "default": 100
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListLeaderboardResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/leaderboard/compare": {
          "get": {
            "tags": [
              "Leaderboard"
            ],
            "summary": "So sánh vị trí của nhiều users",
            "operationId": "compareUsers",
            "parameters": [
              {
                "name": "schoolId",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "userIds",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "integer",
                    "format": "int64"
                  }
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListLeaderboardResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/leaderboard/coins": {
          "get": {
            "tags": [
              "Leaderboard"
            ],
            "summary": "Lấy bảng xếp hạng theo coins",
            "operationId": "getLeaderboardByCoins",
            "parameters": [
              {
                "name": "schoolId",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "pageable",
                "in": "query",
                "required": true,
                "schema": {
                  "$ref": "#/components/schemas/Pageable"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponsePageLeaderboardResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/leaderboard/around-user/{userId}": {
          "get": {
            "tags": [
              "Leaderboard"
            ],
            "summary": "Lấy bảng xếp hạng xung quanh vị trí user theo ID",
            "operationId": "getLeaderboardAroundUser",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "schoolId",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "rangeSize",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "integer",
                  "format": "int32",
                  "default": 10
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListLeaderboardResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/leaderboard/around-me": {
          "get": {
            "tags": [
              "Leaderboard"
            ],
            "summary": "Lấy bảng xếp hạng xung quanh vị trí user hiện tại",
            "operationId": "getLeaderboardAroundMe",
            "parameters": [
              {
                "name": "schoolId",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "rangeSize",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "integer",
                  "format": "int32",
                  "default": 10
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListLeaderboardResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/exams/{id}/take": {
          "get": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Get exam for student to take - shuffles questions/answers, hides correct answers",
            "operationId": "getExamForStudent",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseExamResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/exams/{id}/results": {
          "get": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Get exam results",
            "operationId": "getExamResults",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListExamResultResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/exams/{id}/my-result": {
          "get": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Get current student's result for an exam",
            "operationId": "getMyExamResult",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseExamResultResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/exams/teacher/{teacherId}": {
          "get": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Get exams by teacher",
            "operationId": "getExamsByTeacher",
            "parameters": [
              {
                "name": "teacherId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "pageable",
                "in": "query",
                "required": true,
                "schema": {
                  "$ref": "#/components/schemas/Pageable"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponsePageExamResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/exams/results/{examResultId}/anti-cheat-events": {
          "get": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Lấy lịch sử các sự kiện gian lận của một bài thi",
            "operationId": "getAntiCheatEvents",
            "parameters": [
              {
                "name": "examResultId",
                "in": "path",
                "description": "ID của kết quả thi",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListAntiCheatEvent"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/exams/class/{classId}": {
          "get": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Get exams by class",
            "operationId": "getExamsByClass",
            "parameters": [
              {
                "name": "classId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "pageable",
                "in": "query",
                "required": true,
                "schema": {
                  "$ref": "#/components/schemas/Pageable"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponsePageExamResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/exams/class/{classId}/active": {
          "get": {
            "tags": [
              "Exam Management"
            ],
            "summary": "Get active exams for student",
            "operationId": "getActiveExams",
            "parameters": [
              {
                "name": "classId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListExamResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/dashboard/stats": {
          "get": {
            "tags": [
              "Dashboard"
            ],
            "summary": "Lấy toàn bộ thống kê hệ thống (Admin only)",
            "operationId": "getStats",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseDashboardStatsResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/classes/{classId}/students": {
          "get": {
            "tags": [
              "ClassRoom Management"
            ],
            "summary": "Get active students in classroom",
            "operationId": "getStudentsByClass",
            "parameters": [
              {
                "name": "classId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListClassStudentResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/classes/{classId}/students/search": {
          "get": {
            "tags": [
              "ClassRoom Management"
            ],
            "summary": "Search students by username/fullName/email to add into classroom",
            "operationId": "searchStudentsForClass",
            "parameters": [
              {
                "name": "classId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "keyword",
                "in": "query",
                "required": true,
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListClassStudentResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/classes/teacher/{teacherId}": {
          "get": {
            "tags": [
              "ClassRoom Management"
            ],
            "summary": "Get classrooms by teacher",
            "operationId": "getClassRoomsByTeacher",
            "parameters": [
              {
                "name": "teacherId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListClassRoomResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/classes/student/{studentId}": {
          "get": {
            "tags": [
              "ClassRoom Management"
            ],
            "summary": "Get classrooms by student",
            "operationId": "getClassRoomsByStudent",
            "parameters": [
              {
                "name": "studentId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListClassRoomResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/classes/school/{schoolId}": {
          "get": {
            "tags": [
              "ClassRoom Management"
            ],
            "summary": "Get classrooms by school",
            "operationId": "getClassRoomsBySchool",
            "parameters": [
              {
                "name": "schoolId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              {
                "name": "pageable",
                "in": "query",
                "required": true,
                "schema": {
                  "$ref": "#/components/schemas/Pageable"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponsePageClassRoomResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/badges/{badgeId}": {
          "get": {
            "tags": [
              "Badges"
            ],
            "summary": "Lấy thông tin huy hiệu theo ID",
            "operationId": "getBadgeById",
            "parameters": [
              {
                "name": "badgeId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseBadgeResponse"
                    }
                  }
                }
              }
            }
          },
          "delete": {
            "tags": [
              "Badges"
            ],
            "summary": "Xóa huy hiệu (Admin)",
            "operationId": "deleteBadge",
            "parameters": [
              {
                "name": "badgeId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/badges/users/{userId}": {
          "get": {
            "tags": [
              "Badges"
            ],
            "summary": "Lấy danh sách huy hiệu của người dùng (Teacher/Admin)",
            "operationId": "getUserBadges",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListBadgeResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/badges/users/{userId}/progress": {
          "get": {
            "tags": [
              "Badges"
            ],
            "summary": "Lấy tiến trình badge chưa đạt của người dùng (Teacher/Admin)",
            "operationId": "getUserBadgeProgress",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListBadgeProgressDTO"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/badges/users/{userId}/earned": {
          "get": {
            "tags": [
              "Badges"
            ],
            "summary": "Lấy badge đã đạt của người dùng (Teacher/Admin)",
            "operationId": "getUserEarnedBadges",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListBadgeDTO"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/badges/users/{userId}/count": {
          "get": {
            "tags": [
              "Badges"
            ],
            "summary": "Đếm số huy hiệu của người dùng (Teacher/Admin)",
            "operationId": "getBadgeCount",
            "parameters": [
              {
                "name": "userId",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseInteger"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/badges/me": {
          "get": {
            "tags": [
              "Badges"
            ],
            "summary": "Lấy danh sách huy hiệu của mình",
            "operationId": "getMyBadges",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListBadgeResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/badges/me/progress": {
          "get": {
            "tags": [
              "Badges"
            ],
            "summary": "Lấy tiến trình badge chưa đạt của chính mình",
            "operationId": "getMyBadgeProgress",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListBadgeProgressDTO"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/badges/me/earned": {
          "get": {
            "tags": [
              "Badges"
            ],
            "summary": "Lấy badge đã đạt của chính mình",
            "operationId": "getMyEarnedBadges",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListBadgeDTO"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/badges/definitions": {
          "get": {
            "tags": [
              "Badges"
            ],
            "summary": "Lấy danh sách badge definitions (có filter group) - PUBLIC",
            "operationId": "getBadgeDefinitions",
            "parameters": [
              {
                "name": "group",
                "in": "query",
                "required": false,
                "schema": {
                  "type": "string",
                  "enum": [
                    "STREAK",
                    "LESSON",
                    "QUIZ",
                    "LEVEL",
                    "SPECIAL",
                    "SOCIAL"
                  ]
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseListBadgeDTO"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/auth/health": {
          "get": {
            "tags": [
              "Authentication"
            ],
            "summary": "Kiểm tra trạng thái server",
            "operationId": "healthCheck",
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/schools/{id}/permanent": {
          "delete": {
            "tags": [
              "School Management"
            ],
            "summary": "Permanently delete a school",
            "description": "Admin only - Use with caution",
            "operationId": "hardDeleteSchool",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/notifications/me/{id}": {
          "delete": {
            "tags": [
              "Notifications"
            ],
            "summary": "Xóa thông báo của người dùng hiện tại",
            "operationId": "deleteMyNotification",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        },
        "/api/v1/mistakes/{id}": {
          "delete": {
            "tags": [
              "Mistake Notebook"
            ],
            "summary": "Xóa lỗi sai khỏi sổ tay (STUDENT chỉ xóa được của mình)",
            "operationId": "removeMistake",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "description": "ID của lỗi sai",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "content": {
                  "*/*": {
                    "schema": {
                      "$ref": "#/components/schemas/ApiResponseVoid"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "components": {
        "schemas": {
          "VocabularyRequest": {
            "required": [
              "lessonId",
              "meaning",
              "word"
            ],
            "type": "object",
            "properties": {
              "lessonId": {
                "type": "integer",
                "format": "int64"
              },
              "word": {
                "type": "string"
              },
              "pronunciation": {
                "type": "string"
              },
              "meaning": {
                "type": "string"
              },
              "exampleSentence": {
                "type": "string"
              },
              "imageUrl": {
                "type": "string"
              },
              "audioUrl": {
                "type": "string"
              }
            }
          },
          "ApiResponseVocabularyResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/VocabularyResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "VocabularyResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "word": {
                "type": "string"
              },
              "pronunciation": {
                "type": "string"
              },
              "meaning": {
                "type": "string"
              },
              "exampleSentence": {
                "type": "string"
              },
              "imageUrl": {
                "type": "string"
              },
              "audioUrl": {
                "type": "string"
              },
              "lessonId": {
                "type": "integer",
                "format": "int64"
              },
              "lessonTitle": {
                "type": "string"
              }
            }
          },
          "UpdateUserRequest": {
            "type": "object",
            "properties": {
              "fullName": {
                "type": "string"
              },
              "email": {
                "type": "string"
              },
              "roles": {
                "uniqueItems": true,
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "isActive": {
                "type": "boolean"
              },
              "coins": {
                "type": "integer",
                "format": "int32"
              },
              "classId": {
                "type": "integer",
                "format": "int64"
              }
            }
          },
          "ApiResponseUserResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/UserResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "UserResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "username": {
                "type": "string"
              },
              "email": {
                "type": "string"
              },
              "fullName": {
                "type": "string"
              },
              "avatarUrl": {
                "type": "string"
              },
              "coins": {
                "type": "integer",
                "format": "int32"
              },
              "streakDays": {
                "type": "integer",
                "format": "int32"
              },
              "isActive": {
                "type": "boolean"
              },
              "roles": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "schoolId": {
                "type": "integer",
                "format": "int64"
              },
              "schoolName": {
                "type": "string"
              },
              "classId": {
                "type": "integer",
                "format": "int64"
              },
              "className": {
                "type": "string"
              },
              "createdAt": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "UpdateUserSettingsRequest": {
            "type": "object",
            "properties": {
              "soundEffectsEnabled": {
                "type": "boolean"
              },
              "dailyRemindersEnabled": {
                "type": "boolean"
              },
              "prefersDarkMode": {
                "type": "boolean"
              }
            }
          },
          "ApiResponseUserSettingsResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/UserSettingsResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "UserSettingsResponse": {
            "type": "object",
            "properties": {
              "soundEffectsEnabled": {
                "type": "boolean"
              },
              "dailyRemindersEnabled": {
                "type": "boolean"
              },
              "prefersDarkMode": {
                "type": "boolean"
              },
              "totalStudyMinutes": {
                "type": "integer",
                "format": "int32"
              },
              "weeklyStudyMinutes": {
                "type": "integer",
                "format": "int32"
              },
              "weeklyGoalMinutes": {
                "type": "integer",
                "format": "int32"
              }
            }
          },
          "SchoolRequest": {
            "required": [
              "name"
            ],
            "type": "object",
            "properties": {
              "name": {
                "maxLength": 200,
                "minLength": 0,
                "type": "string"
              },
              "address": {
                "maxLength": 500,
                "minLength": 0,
                "type": "string"
              },
              "phone": {
                "maxLength": 20,
                "minLength": 0,
                "type": "string"
              },
              "email": {
                "maxLength": 100,
                "minLength": 0,
                "type": "string"
              },
              "trialEndDate": {
                "type": "string",
                "format": "date"
              },
              "isActive": {
                "type": "boolean"
              },
              "managerUsername": {
                "type": "string"
              },
              "managerPassword": {
                "type": "string"
              }
            }
          },
          "ApiResponseSchoolResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/SchoolResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "SchoolResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "name": {
                "type": "string"
              },
              "address": {
                "type": "string"
              },
              "phone": {
                "type": "string"
              },
              "email": {
                "type": "string"
              },
              "isActive": {
                "type": "boolean"
              },
              "trialEndDate": {
                "type": "string",
                "format": "date"
              },
              "createdAt": {
                "type": "string",
                "format": "date-time"
              },
              "teacherCount": {
                "type": "integer",
                "format": "int64"
              },
              "studentCount": {
                "type": "integer",
                "format": "int64"
              },
              "classCount": {
                "type": "integer",
                "format": "int64"
              }
            }
          },
          "QuestionOptionRequest": {
            "required": [
              "optionText"
            ],
            "type": "object",
            "properties": {
              "optionText": {
                "type": "string"
              },
              "isCorrect": {
                "type": "boolean"
              }
            }
          },
          "QuestionRequest": {
            "required": [
              "points",
              "questionText",
              "questionType"
            ],
            "type": "object",
            "properties": {
              "lessonId": {
                "type": "integer",
                "format": "int64"
              },
              "vocabularyId": {
                "type": "integer",
                "format": "int64"
              },
              "questionType": {
                "maxLength": 50,
                "minLength": 0,
                "type": "string"
              },
              "questionText": {
                "type": "string"
              },
              "points": {
                "type": "integer",
                "format": "int32"
              },
              "explanation": {
                "type": "string"
              },
              "options": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/QuestionOptionRequest"
                }
              }
            }
          },
          "ApiResponseQuestionResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/QuestionResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "QuestionOptionResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "optionText": {
                "type": "string"
              },
              "isCorrect": {
                "type": "boolean"
              }
            }
          },
          "QuestionResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "questionType": {
                "type": "string"
              },
              "questionText": {
                "type": "string"
              },
              "points": {
                "type": "integer",
                "format": "int32"
              },
              "explanation": {
                "type": "string"
              },
              "lessonId": {
                "type": "integer",
                "format": "int64"
              },
              "lessonTitle": {
                "type": "string"
              },
              "vocabularyId": {
                "type": "integer",
                "format": "int64"
              },
              "vocabularyWord": {
                "type": "string"
              },
              "options": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/QuestionOptionResponse"
                }
              }
            }
          },
          "ApiResponseVoid": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "object"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "LessonRequest": {
            "required": [
              "title"
            ],
            "type": "object",
            "properties": {
              "title": {
                "maxLength": 200,
                "minLength": 0,
                "type": "string"
              },
              "topicId": {
                "type": "integer",
                "format": "int64"
              },
              "contentHtml": {
                "type": "string"
              },
              "grammarHtml": {
                "type": "string"
              },
              "audioUrl": {
                "type": "string"
              },
              "videoUrl": {
                "type": "string"
              },
              "difficultyLevel": {
                "type": "integer",
                "format": "int32"
              },
              "orderIndex": {
                "type": "integer",
                "format": "int32"
              },
              "isPublished": {
                "type": "boolean"
              }
            }
          },
          "ApiResponseLessonResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/LessonResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "LessonResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "title": {
                "type": "string"
              },
              "topicId": {
                "type": "integer",
                "format": "int64"
              },
              "topicName": {
                "type": "string"
              },
              "contentHtml": {
                "type": "string"
              },
              "grammarHtml": {
                "type": "string"
              },
              "audioUrl": {
                "type": "string"
              },
              "videoUrl": {
                "type": "string"
              },
              "difficultyLevel": {
                "type": "integer",
                "format": "int32"
              },
              "orderIndex": {
                "type": "integer",
                "format": "int32"
              },
              "isPublished": {
                "type": "boolean"
              },
              "vocabularyCount": {
                "type": "integer",
                "format": "int32"
              },
              "questionCount": {
                "type": "integer",
                "format": "int32"
              }
            }
          },
          "UpdateLearningProfileRequest": {
            "type": "object",
            "properties": {
              "grammarLevel": {
                "type": "string",
                "enum": [
                  "A1",
                  "A2",
                  "B1",
                  "B2",
                  "C1",
                  "C2"
                ]
              },
              "vocabularyLevel": {
                "type": "string",
                "enum": [
                  "A1",
                  "A2",
                  "B1",
                  "B2",
                  "C1",
                  "C2"
                ]
              },
              "readingLevel": {
                "type": "string",
                "enum": [
                  "A1",
                  "A2",
                  "B1",
                  "B2",
                  "C1",
                  "C2"
                ]
              },
              "listeningLevel": {
                "type": "string",
                "enum": [
                  "A1",
                  "A2",
                  "B1",
                  "B2",
                  "C1",
                  "C2"
                ]
              },
              "primaryGoal": {
                "type": "string",
                "enum": [
                  "COMMUNICATION",
                  "EXAM_PREP",
                  "BUSINESS"
                ]
              },
              "dailyTargetMinutes": {
                "maximum": 120,
                "minimum": 5,
                "type": "integer",
                "format": "int32"
              },
              "preferredTopics": {
                "uniqueItems": true,
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          },
          "ApiResponseLearningProfileResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/LearningProfileResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "LearningProfileResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "userId": {
                "type": "integer",
                "format": "int64"
              },
              "grammarLevel": {
                "type": "string",
                "enum": [
                  "A1",
                  "A2",
                  "B1",
                  "B2",
                  "C1",
                  "C2"
                ]
              },
              "vocabularyLevel": {
                "type": "string",
                "enum": [
                  "A1",
                  "A2",
                  "B1",
                  "B2",
                  "C1",
                  "C2"
                ]
              },
              "readingLevel": {
                "type": "string",
                "enum": [
                  "A1",
                  "A2",
                  "B1",
                  "B2",
                  "C1",
                  "C2"
                ]
              },
              "listeningLevel": {
                "type": "string",
                "enum": [
                  "A1",
                  "A2",
                  "B1",
                  "B2",
                  "C1",
                  "C2"
                ]
              },
              "overallLevel": {
                "type": "string",
                "enum": [
                  "A1",
                  "A2",
                  "B1",
                  "B2",
                  "C1",
                  "C2"
                ]
              },
              "primaryGoal": {
                "type": "string",
                "enum": [
                  "COMMUNICATION",
                  "EXAM_PREP",
                  "BUSINESS"
                ]
              },
              "dailyTargetMinutes": {
                "type": "integer",
                "format": "int32"
              },
              "preferredTopics": {
                "uniqueItems": true,
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "weakSkills": {
                "uniqueItems": true,
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "GRAMMAR",
                    "VOCABULARY",
                    "READING",
                    "LISTENING"
                  ]
                }
              },
              "onboardingCompleted": {
                "type": "boolean"
              },
              "hasCompletedOnboarding": {
                "type": "boolean"
              }
            }
          },
          "ExamRequest": {
            "required": [
              "classId",
              "durationMinutes",
              "endTime",
              "startTime",
              "title"
            ],
            "type": "object",
            "properties": {
              "title": {
                "maxLength": 200,
                "minLength": 0,
                "type": "string"
              },
              "classId": {
                "type": "integer",
                "format": "int64"
              },
              "startTime": {
                "type": "string",
                "format": "date-time"
              },
              "endTime": {
                "type": "string",
                "format": "date-time"
              },
              "durationMinutes": {
                "maximum": 180,
                "minimum": 1,
                "type": "integer",
                "format": "int32"
              },
              "shuffleQuestions": {
                "type": "boolean"
              },
              "shuffleAnswers": {
                "type": "boolean"
              },
              "antiCheatEnabled": {
                "type": "boolean"
              },
              "questionIds": {
                "type": "array",
                "items": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            }
          },
          "ApiResponseExamResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/ExamResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ExamResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "title": {
                "type": "string"
              },
              "status": {
                "type": "string"
              },
              "scorePublished": {
                "type": "boolean"
              },
              "schoolId": {
                "type": "integer",
                "format": "int64"
              },
              "schoolName": {
                "type": "string"
              },
              "classId": {
                "type": "integer",
                "format": "int64"
              },
              "className": {
                "type": "string"
              },
              "teacherId": {
                "type": "integer",
                "format": "int64"
              },
              "teacherName": {
                "type": "string"
              },
              "startTime": {
                "type": "string",
                "format": "date-time"
              },
              "endTime": {
                "type": "string",
                "format": "date-time"
              },
              "durationMinutes": {
                "type": "integer",
                "format": "int32"
              },
              "shuffleQuestions": {
                "type": "boolean"
              },
              "shuffleAnswers": {
                "type": "boolean"
              },
              "antiCheatEnabled": {
                "type": "boolean"
              },
              "questionCount": {
                "type": "integer",
                "format": "int32"
              },
              "totalPoints": {
                "type": "integer",
                "format": "int32"
              },
              "submittedCount": {
                "type": "integer",
                "format": "int64"
              },
              "averageScore": {
                "type": "number",
                "format": "double"
              },
              "questions": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/QuestionResponse"
                }
              }
            }
          },
          "ClassRoomRequest": {
            "required": [
              "name"
            ],
            "type": "object",
            "properties": {
              "name": {
                "maxLength": 100,
                "minLength": 0,
                "type": "string"
              },
              "schoolId": {
                "type": "integer",
                "format": "int64"
              },
              "teacherId": {
                "type": "integer",
                "format": "int64"
              },
              "academicYear": {
                "maxLength": 20,
                "minLength": 0,
                "type": "string"
              },
              "isActive": {
                "type": "boolean"
              }
            }
          },
          "ApiResponseClassRoomResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/ClassRoomResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ClassRoomResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "name": {
                "type": "string"
              },
              "academicYear": {
                "type": "string"
              },
              "isActive": {
                "type": "boolean"
              },
              "schoolId": {
                "type": "integer",
                "format": "int64"
              },
              "schoolName": {
                "type": "string"
              },
              "teacherId": {
                "type": "integer",
                "format": "int64"
              },
              "teacherName": {
                "type": "string"
              },
              "studentCount": {
                "type": "integer",
                "format": "int64"
              },
              "createdAt": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponseMapStringObject": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "object",
                "additionalProperties": {
                  "type": "object"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "CreateUserRequest": {
            "required": [
              "email",
              "fullName",
              "password",
              "roles",
              "username"
            ],
            "type": "object",
            "properties": {
              "username": {
                "maxLength": 50,
                "minLength": 3,
                "type": "string"
              },
              "email": {
                "type": "string"
              },
              "password": {
                "maxLength": 2147483647,
                "minLength": 6,
                "type": "string"
              },
              "fullName": {
                "type": "string"
              },
              "roles": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "schoolId": {
                "type": "integer",
                "format": "int64"
              },
              "classId": {
                "type": "integer",
                "format": "int64"
              }
            }
          },
          "ApiResponseString": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "string"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "SrsReviewRequest": {
            "required": [
              "vocabularyId"
            ],
            "type": "object",
            "properties": {
              "vocabularyId": {
                "type": "integer",
                "format": "int64"
              },
              "quality": {
                "maximum": 5,
                "minimum": 0,
                "type": "integer",
                "format": "int32"
              }
            }
          },
          "ApiResponseSrsDueResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/SrsDueResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "SrsDueResponse": {
            "type": "object",
            "properties": {
              "vocabularyId": {
                "type": "integer",
                "format": "int64"
              },
              "grammarId": {
                "type": "integer",
                "format": "int64"
              },
              "contentType": {
                "type": "string"
              },
              "word": {
                "type": "string"
              },
              "pronunciation": {
                "type": "string"
              },
              "meaning": {
                "type": "string"
              },
              "exampleSentence": {
                "type": "string"
              },
              "audioUrl": {
                "type": "string"
              },
              "easinessFactor": {
                "type": "number",
                "format": "double"
              },
              "intervalDays": {
                "type": "integer",
                "format": "int32"
              },
              "repetitions": {
                "type": "integer",
                "format": "int32"
              },
              "nextReviewAt": {
                "type": "string",
                "format": "date"
              },
              "lastReviewedAt": {
                "type": "string",
                "format": "date-time"
              },
              "overdueDays": {
                "type": "integer",
                "format": "int32"
              },
              "totalDue": {
                "type": "integer",
                "format": "int32"
              },
              "totalReviewedToday": {
                "type": "integer",
                "format": "int32"
              },
              "items": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/SrsDueResponse"
                }
              }
            }
          },
          "DailyQuestRequest": {
            "type": "object",
            "properties": {
              "tasks": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/DailyQuestTaskRequest"
                }
              }
            }
          },
          "DailyQuestTaskRequest": {
            "type": "object",
            "properties": {
              "taskType": {
                "type": "string"
              },
              "targetCount": {
                "type": "integer",
                "format": "int32"
              }
            }
          },
          "ApiResponseDailyQuestResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/DailyQuestResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "DailyQuestResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "questDate": {
                "type": "string",
                "format": "date"
              },
              "isCompleted": {
                "type": "boolean"
              },
              "tasks": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/DailyQuestTaskResponse"
                }
              },
              "totalCoins": {
                "type": "integer",
                "format": "int32"
              }
            }
          },
          "DailyQuestTaskResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "taskType": {
                "type": "string"
              },
              "targetCount": {
                "type": "integer",
                "format": "int32"
              },
              "currentProgress": {
                "type": "integer",
                "format": "int32"
              },
              "isCompleted": {
                "type": "boolean"
              },
              "coins": {
                "type": "integer",
                "format": "int32"
              }
            }
          },
          "ApiResponseProgressResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/ProgressResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ProgressResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "userId": {
                "type": "integer",
                "format": "int64"
              },
              "userName": {
                "type": "string"
              },
              "lessonId": {
                "type": "integer",
                "format": "int64"
              },
              "lessonTitle": {
                "type": "string"
              },
              "completionPercentage": {
                "type": "integer",
                "format": "int32"
              },
              "isCompleted": {
                "type": "boolean"
              },
              "lastAccessed": {
                "type": "string",
                "format": "date-time"
              },
              "questTaskCompleted": {
                "type": "boolean"
              }
            }
          },
          "ApiResponsePlacementSessionResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/PlacementSessionResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "PlacementSessionResponse": {
            "type": "object",
            "properties": {
              "sessionId": {
                "type": "string"
              }
            }
          },
          "PlacementAnswerRequest": {
            "required": [
              "questionId",
              "selectedAnswer"
            ],
            "type": "object",
            "properties": {
              "questionId": {
                "type": "integer",
                "format": "int64"
              },
              "selectedAnswer": {
                "type": "string"
              },
              "timeSpentSeconds": {
                "maximum": 3600,
                "minimum": 0,
                "type": "integer",
                "format": "int32"
              }
            }
          },
          "ApiResponsePlacementAnswerAccepted": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/PlacementAnswerAccepted"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "PlacementAnswerAccepted": {
            "type": "object",
            "properties": {
              "nextQuestionAvailable": {
                "type": "boolean"
              },
              "result": {
                "$ref": "#/components/schemas/PlacementResultResponse"
              }
            }
          },
          "PlacementResultResponse": {
            "type": "object",
            "properties": {
              "sessionId": {
                "type": "string"
              },
              "completed": {
                "type": "boolean"
              },
              "skillLevels": {
                "type": "object",
                "additionalProperties": {
                  "type": "string",
                  "enum": [
                    "A1",
                    "A2",
                    "B1",
                    "B2",
                    "C1",
                    "C2"
                  ]
                }
              },
              "grammarLevel": {
                "type": "string",
                "enum": [
                  "A1",
                  "A2",
                  "B1",
                  "B2",
                  "C1",
                  "C2"
                ]
              },
              "vocabularyLevel": {
                "type": "string",
                "enum": [
                  "A1",
                  "A2",
                  "B1",
                  "B2",
                  "C1",
                  "C2"
                ]
              },
              "readingLevel": {
                "type": "string",
                "enum": [
                  "A1",
                  "A2",
                  "B1",
                  "B2",
                  "C1",
                  "C2"
                ]
              },
              "listeningLevel": {
                "type": "string",
                "enum": [
                  "A1",
                  "A2",
                  "B1",
                  "B2",
                  "C1",
                  "C2"
                ]
              },
              "overallLevel": {
                "type": "string",
                "enum": [
                  "A1",
                  "A2",
                  "B1",
                  "B2",
                  "C1",
                  "C2"
                ]
              },
              "effectiveStartLevel": {
                "type": "string",
                "enum": [
                  "A1",
                  "A2",
                  "B1",
                  "B2",
                  "C1",
                  "C2"
                ]
              },
              "correctCounts": {
                "type": "object",
                "additionalProperties": {
                  "type": "integer",
                  "format": "int32"
                }
              },
              "totalCounts": {
                "type": "object",
                "additionalProperties": {
                  "type": "integer",
                  "format": "int32"
                }
              }
            }
          },
          "BroadcastNotificationRequest": {
            "type": "object",
            "properties": {
              "title": {
                "type": "string"
              },
              "message": {
                "type": "string"
              },
              "imageUrl": {
                "type": "string"
              },
              "scope": {
                "type": "string"
              },
              "targetRole": {
                "type": "string"
              },
              "schoolId": {
                "type": "integer",
                "format": "int64"
              },
              "classId": {
                "type": "integer",
                "format": "int64"
              }
            }
          },
          "MistakeNotebookRequest": {
            "required": [
              "vocabularyId"
            ],
            "type": "object",
            "properties": {
              "userId": {
                "type": "integer",
                "format": "int64"
              },
              "vocabularyId": {
                "type": "integer",
                "format": "int64"
              },
              "userRecordingUrl": {
                "type": "string"
              }
            }
          },
          "ApiResponseMistakeNotebookDTO": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/MistakeNotebookDTO"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "MistakeNotebookDTO": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "userId": {
                "type": "integer",
                "format": "int64"
              },
              "vocabularyId": {
                "type": "integer",
                "format": "int64"
              },
              "word": {
                "type": "string"
              },
              "meaning": {
                "type": "string"
              },
              "pronunciation": {
                "type": "string"
              },
              "audioUrl": {
                "type": "string"
              },
              "mistakeCount": {
                "type": "integer",
                "format": "int32"
              },
              "userRecordingUrl": {
                "type": "string"
              },
              "addedAt": {
                "type": "string",
                "format": "date-time"
              },
              "lastMistakeAt": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "WritingFeedbackRequest": {
            "required": [
              "contentId",
              "contentType",
              "userText"
            ],
            "type": "object",
            "properties": {
              "contentType": {
                "type": "string"
              },
              "contentId": {
                "type": "integer",
                "format": "int64"
              },
              "userText": {
                "type": "string"
              }
            }
          },
          "CompleteOnboardingRequest": {
            "required": [
              "primaryGoal"
            ],
            "type": "object",
            "properties": {
              "primaryGoal": {
                "type": "string",
                "enum": [
                  "COMMUNICATION",
                  "EXAM_PREP",
                  "BUSINESS"
                ]
              },
              "dailyTargetMinutes": {
                "maximum": 300,
                "minimum": 1,
                "type": "integer",
                "format": "int32"
              },
              "preferredTopics": {
                "uniqueItems": true,
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          },
          "AnswerDTO": {
            "type": "object",
            "properties": {
              "questionId": {
                "type": "integer",
                "format": "int64"
              },
              "selectedOptionId": {
                "type": "integer",
                "format": "int64"
              },
              "selectedOptionIds": {
                "type": "array",
                "items": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              "textAnswer": {
                "type": "string"
              }
            }
          },
          "ExamSubmitDTO": {
            "required": [
              "examResultId"
            ],
            "type": "object",
            "properties": {
              "examResultId": {
                "type": "integer",
                "format": "int64"
              },
              "answers": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/AnswerDTO"
                }
              }
            }
          },
          "ApiResponseExamResultDTO": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/ExamResultDTO"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ExamResultDTO": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "examId": {
                "type": "integer",
                "format": "int64"
              },
              "examTitle": {
                "type": "string"
              },
              "studentId": {
                "type": "integer",
                "format": "int64"
              },
              "studentName": {
                "type": "string"
              },
              "score": {
                "type": "number"
              },
              "correctCount": {
                "type": "integer",
                "format": "int32"
              },
              "totalQuestions": {
                "type": "integer",
                "format": "int32"
              },
              "percentage": {
                "type": "number",
                "format": "double"
              },
              "grade": {
                "type": "string"
              },
              "submittedAt": {
                "type": "string",
                "format": "date-time"
              },
              "violationCount": {
                "type": "integer",
                "format": "int32"
              },
              "status": {
                "type": "string"
              }
            }
          },
          "ApiResponseExamTakeDTO": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/ExamTakeDTO"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ExamQuestionDTO": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "questionText": {
                "type": "string"
              },
              "questionType": {
                "type": "string"
              },
              "points": {
                "type": "integer",
                "format": "int32"
              },
              "options": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/QuestionOptionDTO"
                }
              }
            }
          },
          "ExamTakeDTO": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "title": {
                "type": "string"
              },
              "durationMinutes": {
                "type": "integer",
                "format": "int32"
              },
              "startTime": {
                "type": "string",
                "format": "date-time"
              },
              "endTime": {
                "type": "string",
                "format": "date-time"
              },
              "antiCheatEnabled": {
                "type": "boolean"
              },
              "examResultId": {
                "type": "integer",
                "format": "int64"
              },
              "questions": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ExamQuestionDTO"
                }
              },
              "totalQuestions": {
                "type": "integer",
                "format": "int32"
              }
            }
          },
          "QuestionOptionDTO": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "optionText": {
                "type": "string"
              }
            }
          },
          "AntiCheatEventDTO": {
            "required": [
              "eventType",
              "examResultId"
            ],
            "type": "object",
            "properties": {
              "examResultId": {
                "type": "integer",
                "format": "int64"
              },
              "eventType": {
                "type": "string"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              },
              "details": {
                "type": "string"
              }
            }
          },
          "AnswerSubmission": {
            "required": [
              "questionId"
            ],
            "type": "object",
            "properties": {
              "questionId": {
                "type": "integer",
                "format": "int64"
              },
              "selectedOptionId": {
                "type": "integer",
                "format": "int64"
              },
              "answerText": {
                "type": "string"
              }
            }
          },
          "SubmitExamRequest": {
            "required": [
              "answers",
              "examId"
            ],
            "type": "object",
            "properties": {
              "examId": {
                "type": "integer",
                "format": "int64"
              },
              "answers": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/AnswerSubmission"
                }
              }
            }
          },
          "ApiResponseExamResultResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/ExamResultResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ExamResultResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "examId": {
                "type": "integer",
                "format": "int64"
              },
              "examTitle": {
                "type": "string"
              },
              "studentId": {
                "type": "integer",
                "format": "int64"
              },
              "studentName": {
                "type": "string"
              },
              "score": {
                "type": "number"
              },
              "correctCount": {
                "type": "integer",
                "format": "int32"
              },
              "totalQuestions": {
                "type": "integer",
                "format": "int32"
              },
              "percentage": {
                "type": "number",
                "format": "double"
              },
              "submittedAt": {
                "type": "string",
                "format": "date-time"
              },
              "violationCount": {
                "type": "integer",
                "format": "int32"
              },
              "grade": {
                "type": "string"
              }
            }
          },
          "BatchEventRequest": {
            "required": [
              "events"
            ],
            "type": "object",
            "properties": {
              "events": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/EventItem"
                }
              }
            }
          },
          "EventItem": {
            "required": [
              "eventType"
            ],
            "type": "object",
            "properties": {
              "eventType": {
                "pattern": "^[A-Z_]{1,50}$",
                "type": "string"
              },
              "contentType": {
                "type": "string"
              },
              "contentId": {
                "type": "integer",
                "format": "int64"
              },
              "skill": {
                "type": "string",
                "enum": [
                  "GRAMMAR",
                  "VOCABULARY",
                  "READING",
                  "LISTENING"
                ]
              },
              "cefrLevel": {
                "type": "string"
              },
              "isCorrect": {
                "type": "boolean"
              },
              "timeSpentSeconds": {
                "type": "integer",
                "format": "int32"
              },
              "sessionId": {
                "type": "string"
              },
              "metadata": {
                "maxLength": 2000,
                "minLength": 0,
                "type": "string"
              }
            }
          },
          "BadgeRequest": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "iconUrl": {
                "type": "string"
              }
            }
          },
          "ApiResponseBadgeResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/BadgeResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "BadgeResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "name": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "iconUrl": {
                "type": "string"
              },
              "earnedAt": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponseListBadgeResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/BadgeResponse"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponseCheckBadgeResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/CheckBadgeResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "BadgeDTO": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "badgeKey": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "iconEmoji": {
                "type": "string"
              },
              "groupName": {
                "type": "string",
                "enum": [
                  "STREAK",
                  "LESSON",
                  "QUIZ",
                  "LEVEL",
                  "SPECIAL",
                  "SOCIAL"
                ]
              },
              "difficulty": {
                "type": "string",
                "enum": [
                  "EASY",
                  "MEDIUM",
                  "HARD",
                  "LEGENDARY"
                ]
              },
              "isSecret": {
                "type": "boolean"
              },
              "earnedAt": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "CheckBadgeResponse": {
            "type": "object",
            "properties": {
              "newlyEarnedBadges": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/BadgeDTO"
                }
              },
              "totalBadgesEarned": {
                "type": "integer",
                "format": "int32"
              },
              "message": {
                "type": "string"
              }
            }
          },
          "ResetPasswordRequest": {
            "required": [
              "confirmPassword",
              "newPassword",
              "otp"
            ],
            "type": "object",
            "properties": {
              "otp": {
                "maxLength": 6,
                "minLength": 6,
                "type": "string"
              },
              "newPassword": {
                "maxLength": 2147483647,
                "minLength": 6,
                "type": "string"
              },
              "confirmPassword": {
                "type": "string"
              }
            }
          },
          "RegisterRequest": {
            "required": [
              "email",
              "fullName",
              "password",
              "username"
            ],
            "type": "object",
            "properties": {
              "username": {
                "maxLength": 50,
                "minLength": 3,
                "type": "string"
              },
              "email": {
                "type": "string"
              },
              "password": {
                "maxLength": 2147483647,
                "minLength": 6,
                "type": "string"
              },
              "fullName": {
                "type": "string"
              },
              "role": {
                "type": "string"
              }
            }
          },
          "ApiResponseAuthResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/AuthResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "AuthResponse": {
            "type": "object",
            "properties": {
              "accessToken": {
                "type": "string"
              },
              "refreshToken": {
                "type": "string"
              },
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "username": {
                "type": "string"
              },
              "email": {
                "type": "string"
              },
              "roles": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          },
          "LoginRequest": {
            "required": [
              "password",
              "username"
            ],
            "type": "object",
            "properties": {
              "username": {
                "type": "string"
              },
              "password": {
                "type": "string"
              }
            }
          },
          "GoogleLoginRequest": {
            "required": [
              "accessToken"
            ],
            "type": "object",
            "properties": {
              "accessToken": {
                "type": "string"
              }
            }
          },
          "ForgotPasswordRequest": {
            "required": [
              "email"
            ],
            "type": "object",
            "properties": {
              "email": {
                "type": "string"
              }
            }
          },
          "ChangePasswordRequest": {
            "required": [
              "confirmPassword",
              "newPassword",
              "oldPassword"
            ],
            "type": "object",
            "properties": {
              "oldPassword": {
                "type": "string"
              },
              "newPassword": {
                "maxLength": 2147483647,
                "minLength": 6,
                "type": "string"
              },
              "confirmPassword": {
                "type": "string"
              }
            }
          },
          "ApiResponseListVocabularyResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/VocabularyResponse"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "Pageable": {
            "type": "object",
            "properties": {
              "page": {
                "minimum": 0,
                "type": "integer",
                "format": "int32"
              },
              "size": {
                "minimum": 1,
                "type": "integer",
                "format": "int32"
              },
              "sort": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          },
          "ApiResponsePageVocabularyResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/PageVocabularyResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "PageVocabularyResponse": {
            "type": "object",
            "properties": {
              "totalElements": {
                "type": "integer",
                "format": "int64"
              },
              "totalPages": {
                "type": "integer",
                "format": "int32"
              },
              "pageable": {
                "$ref": "#/components/schemas/PageableObject"
              },
              "size": {
                "type": "integer",
                "format": "int32"
              },
              "content": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/VocabularyResponse"
                }
              },
              "number": {
                "type": "integer",
                "format": "int32"
              },
              "sort": {
                "$ref": "#/components/schemas/SortObject"
              },
              "numberOfElements": {
                "type": "integer",
                "format": "int32"
              },
              "first": {
                "type": "boolean"
              },
              "last": {
                "type": "boolean"
              },
              "empty": {
                "type": "boolean"
              }
            }
          },
          "PageableObject": {
            "type": "object",
            "properties": {
              "pageNumber": {
                "type": "integer",
                "format": "int32"
              },
              "pageSize": {
                "type": "integer",
                "format": "int32"
              },
              "paged": {
                "type": "boolean"
              },
              "unpaged": {
                "type": "boolean"
              },
              "offset": {
                "type": "integer",
                "format": "int64"
              },
              "sort": {
                "$ref": "#/components/schemas/SortObject"
              }
            }
          },
          "SortObject": {
            "type": "object",
            "properties": {
              "sorted": {
                "type": "boolean"
              },
              "unsorted": {
                "type": "boolean"
              },
              "empty": {
                "type": "boolean"
              }
            }
          },
          "ApiResponseLong": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "integer",
                "format": "int64"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponsePageUserResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/PageUserResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "PageUserResponse": {
            "type": "object",
            "properties": {
              "totalElements": {
                "type": "integer",
                "format": "int64"
              },
              "totalPages": {
                "type": "integer",
                "format": "int32"
              },
              "pageable": {
                "$ref": "#/components/schemas/PageableObject"
              },
              "size": {
                "type": "integer",
                "format": "int32"
              },
              "content": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/UserResponse"
                }
              },
              "number": {
                "type": "integer",
                "format": "int32"
              },
              "sort": {
                "$ref": "#/components/schemas/SortObject"
              },
              "numberOfElements": {
                "type": "integer",
                "format": "int32"
              },
              "first": {
                "type": "boolean"
              },
              "last": {
                "type": "boolean"
              },
              "empty": {
                "type": "boolean"
              }
            }
          },
          "AdminUserStatsResponse": {
            "type": "object",
            "properties": {
              "totalUsers": {
                "type": "integer",
                "format": "int64"
              },
              "activeUsers": {
                "type": "integer",
                "format": "int64"
              },
              "teacherCount": {
                "type": "integer",
                "format": "int64"
              },
              "studentCount": {
                "type": "integer",
                "format": "int64"
              },
              "totalCoins": {
                "type": "integer",
                "format": "int64"
              }
            }
          },
          "ApiResponseAdminUserStatsResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/AdminUserStatsResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponseListAuditLogResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/AuditLogResponse"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "AuditLogResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "action": {
                "type": "string"
              },
              "details": {
                "type": "string"
              },
              "ipAddress": {
                "type": "string"
              },
              "userAgent": {
                "type": "string"
              },
              "createdAt": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponseListMapStringObject": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "type": "object",
                  "additionalProperties": {
                    "type": "object"
                  }
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponseListLessonResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/LessonResponse"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponseListSchoolResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/SchoolResponse"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponsePageSchoolResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/PageSchoolResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "PageSchoolResponse": {
            "type": "object",
            "properties": {
              "totalElements": {
                "type": "integer",
                "format": "int64"
              },
              "totalPages": {
                "type": "integer",
                "format": "int32"
              },
              "pageable": {
                "$ref": "#/components/schemas/PageableObject"
              },
              "size": {
                "type": "integer",
                "format": "int32"
              },
              "content": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/SchoolResponse"
                }
              },
              "number": {
                "type": "integer",
                "format": "int32"
              },
              "sort": {
                "$ref": "#/components/schemas/SortObject"
              },
              "numberOfElements": {
                "type": "integer",
                "format": "int32"
              },
              "first": {
                "type": "boolean"
              },
              "last": {
                "type": "boolean"
              },
              "empty": {
                "type": "boolean"
              }
            }
          },
          "ApiResponseRecommendationResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/RecommendationResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "RecommendationResponse": {
            "type": "object",
            "properties": {
              "total": {
                "type": "integer",
                "format": "int32"
              },
              "lessons": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/RecommendedLesson"
                }
              },
              "reasons": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          },
          "RecommendedLesson": {
            "type": "object",
            "properties": {
              "lessonId": {
                "type": "integer",
                "format": "int64"
              },
              "title": {
                "type": "string"
              },
              "difficultyLevel": {
                "type": "integer",
                "format": "int32"
              },
              "topicName": {
                "type": "string"
              },
              "completionPercentage": {
                "type": "integer",
                "format": "int32"
              },
              "isCompleted": {
                "type": "boolean"
              },
              "cefrLevel": {
                "type": "string"
              },
              "tags": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "reason": {
                "type": "string"
              },
              "relevanceScore": {
                "type": "number",
                "format": "double"
              }
            }
          },
          "ApiResponseListDailyQuestResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/DailyQuestResponse"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponseListQuestionResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/QuestionResponse"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponsePageQuestionResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/PageQuestionResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "PageQuestionResponse": {
            "type": "object",
            "properties": {
              "totalElements": {
                "type": "integer",
                "format": "int64"
              },
              "totalPages": {
                "type": "integer",
                "format": "int32"
              },
              "pageable": {
                "$ref": "#/components/schemas/PageableObject"
              },
              "size": {
                "type": "integer",
                "format": "int32"
              },
              "content": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/QuestionResponse"
                }
              },
              "number": {
                "type": "integer",
                "format": "int32"
              },
              "sort": {
                "$ref": "#/components/schemas/SortObject"
              },
              "numberOfElements": {
                "type": "integer",
                "format": "int32"
              },
              "first": {
                "type": "boolean"
              },
              "last": {
                "type": "boolean"
              },
              "empty": {
                "type": "boolean"
              }
            }
          },
          "ApiResponseMapStringLong": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "object",
                "additionalProperties": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponseListProgressResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ProgressResponse"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponsePlacementResultResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/PlacementResultResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponsePlacementQuestionResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/PlacementQuestionResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "PlacementQuestionResponse": {
            "type": "object",
            "properties": {
              "questionId": {
                "type": "integer",
                "format": "int64"
              },
              "skill": {
                "type": "string",
                "enum": [
                  "GRAMMAR",
                  "VOCABULARY",
                  "READING",
                  "LISTENING"
                ]
              },
              "questionText": {
                "type": "string"
              },
              "options": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "questionIndex": {
                "type": "integer",
                "format": "int32"
              },
              "totalQuestions": {
                "type": "integer",
                "format": "int32"
              },
              "sessionId": {
                "type": "string"
              }
            }
          },
          "ApiResponseListNotificationResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/NotificationResponse"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "NotificationResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "title": {
                "type": "string"
              },
              "message": {
                "type": "string"
              },
              "imageUrl": {
                "type": "string"
              },
              "isRead": {
                "type": "boolean"
              },
              "createdAt": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponseListMistakeNotebookDTO": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/MistakeNotebookDTO"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponsePageLessonResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/PageLessonResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "PageLessonResponse": {
            "type": "object",
            "properties": {
              "totalElements": {
                "type": "integer",
                "format": "int64"
              },
              "totalPages": {
                "type": "integer",
                "format": "int32"
              },
              "pageable": {
                "$ref": "#/components/schemas/PageableObject"
              },
              "size": {
                "type": "integer",
                "format": "int32"
              },
              "content": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/LessonResponse"
                }
              },
              "number": {
                "type": "integer",
                "format": "int32"
              },
              "sort": {
                "$ref": "#/components/schemas/SortObject"
              },
              "numberOfElements": {
                "type": "integer",
                "format": "int32"
              },
              "first": {
                "type": "boolean"
              },
              "last": {
                "type": "boolean"
              },
              "empty": {
                "type": "boolean"
              }
            }
          },
          "ApiResponseLearningProfileStatusResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/LearningProfileStatusResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "LearningProfileStatusResponse": {
            "type": "object",
            "properties": {
              "onboardingCompleted": {
                "type": "boolean"
              }
            }
          },
          "ApiResponseLearningPathResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/LearningPathResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "LearningPathResponse": {
            "type": "object",
            "properties": {
              "pathId": {
                "type": "integer",
                "format": "int64"
              },
              "name": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "targetCefr": {
                "type": "string"
              },
              "targetGoal": {
                "type": "string"
              },
              "estimatedDays": {
                "type": "integer",
                "format": "int32"
              },
              "nodes": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/PathNodeResponse"
                }
              }
            }
          },
          "PathNodeResponse": {
            "type": "object",
            "properties": {
              "nodeId": {
                "type": "integer",
                "format": "int64"
              },
              "lessonId": {
                "type": "integer",
                "format": "int64"
              },
              "lessonTitle": {
                "type": "string"
              },
              "skill": {
                "type": "string"
              },
              "cefrLevel": {
                "type": "string"
              },
              "orderIndex": {
                "type": "integer",
                "format": "int32"
              },
              "estimatedMinutes": {
                "type": "integer",
                "format": "int32"
              },
              "isRequired": {
                "type": "boolean"
              },
              "prerequisiteNodeIds": {
                "type": "array",
                "items": {
                  "type": "integer",
                  "format": "int64"
                }
              },
              "isCompleted": {
                "type": "boolean"
              },
              "completionPercentage": {
                "type": "integer",
                "format": "int32"
              }
            }
          },
          "ApiResponseLeaderboardResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/LeaderboardResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "LeaderboardResponse": {
            "type": "object",
            "properties": {
              "rank": {
                "type": "integer",
                "format": "int32"
              },
              "userId": {
                "type": "integer",
                "format": "int64"
              },
              "username": {
                "type": "string"
              },
              "fullName": {
                "type": "string"
              },
              "avatarUrl": {
                "type": "string"
              },
              "totalCoins": {
                "type": "integer",
                "format": "int32"
              },
              "streakDays": {
                "type": "integer",
                "format": "int32"
              },
              "averageScore": {
                "type": "number",
                "format": "double"
              }
            }
          },
          "ApiResponseListLeaderboardResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/LeaderboardResponse"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponsePageLeaderboardResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/PageLeaderboardResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "PageLeaderboardResponse": {
            "type": "object",
            "properties": {
              "totalElements": {
                "type": "integer",
                "format": "int64"
              },
              "totalPages": {
                "type": "integer",
                "format": "int32"
              },
              "pageable": {
                "$ref": "#/components/schemas/PageableObject"
              },
              "size": {
                "type": "integer",
                "format": "int32"
              },
              "content": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/LeaderboardResponse"
                }
              },
              "number": {
                "type": "integer",
                "format": "int32"
              },
              "sort": {
                "$ref": "#/components/schemas/SortObject"
              },
              "numberOfElements": {
                "type": "integer",
                "format": "int32"
              },
              "first": {
                "type": "boolean"
              },
              "last": {
                "type": "boolean"
              },
              "empty": {
                "type": "boolean"
              }
            }
          },
          "ApiResponsePageExamResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/PageExamResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "PageExamResponse": {
            "type": "object",
            "properties": {
              "totalElements": {
                "type": "integer",
                "format": "int64"
              },
              "totalPages": {
                "type": "integer",
                "format": "int32"
              },
              "pageable": {
                "$ref": "#/components/schemas/PageableObject"
              },
              "size": {
                "type": "integer",
                "format": "int32"
              },
              "content": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ExamResponse"
                }
              },
              "number": {
                "type": "integer",
                "format": "int32"
              },
              "sort": {
                "$ref": "#/components/schemas/SortObject"
              },
              "numberOfElements": {
                "type": "integer",
                "format": "int32"
              },
              "first": {
                "type": "boolean"
              },
              "last": {
                "type": "boolean"
              },
              "empty": {
                "type": "boolean"
              }
            }
          },
          "ApiResponseListExamResultResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ExamResultResponse"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "AntiCheatEvent": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "eventType": {
                "type": "string"
              },
              "eventTime": {
                "type": "string",
                "format": "date-time"
              },
              "details": {
                "type": "string"
              }
            }
          },
          "ApiResponseListAntiCheatEvent": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/AntiCheatEvent"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponseListExamResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ExamResponse"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponseDashboardStatsResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/DashboardStatsResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "DashboardStatsResponse": {
            "type": "object",
            "properties": {
              "totalUsers": {
                "type": "integer",
                "format": "int64"
              },
              "activeUsers": {
                "type": "integer",
                "format": "int64"
              },
              "teacherCount": {
                "type": "integer",
                "format": "int64"
              },
              "studentCount": {
                "type": "integer",
                "format": "int64"
              },
              "totalSchools": {
                "type": "integer",
                "format": "int64"
              },
              "activeSchools": {
                "type": "integer",
                "format": "int64"
              },
              "totalExams": {
                "type": "integer",
                "format": "int64"
              },
              "totalQuestions": {
                "type": "integer",
                "format": "int64"
              },
              "totalClasses": {
                "type": "integer",
                "format": "int64"
              },
              "totalAttempts": {
                "type": "integer",
                "format": "int64"
              },
              "averageScore": {
                "type": "number",
                "format": "double"
              }
            }
          },
          "ApiResponseListClassRoomResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ClassRoomResponse"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponseListClassStudentResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ClassStudentResponse"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ClassStudentResponse": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "username": {
                "type": "string"
              },
              "fullName": {
                "type": "string"
              },
              "email": {
                "type": "string"
              },
              "avatarUrl": {
                "type": "string"
              },
              "status": {
                "type": "string"
              },
              "joinedAt": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponsePageClassRoomResponse": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "$ref": "#/components/schemas/PageClassRoomResponse"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "PageClassRoomResponse": {
            "type": "object",
            "properties": {
              "totalElements": {
                "type": "integer",
                "format": "int64"
              },
              "totalPages": {
                "type": "integer",
                "format": "int32"
              },
              "pageable": {
                "$ref": "#/components/schemas/PageableObject"
              },
              "size": {
                "type": "integer",
                "format": "int32"
              },
              "content": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ClassRoomResponse"
                }
              },
              "number": {
                "type": "integer",
                "format": "int32"
              },
              "sort": {
                "$ref": "#/components/schemas/SortObject"
              },
              "numberOfElements": {
                "type": "integer",
                "format": "int32"
              },
              "first": {
                "type": "boolean"
              },
              "last": {
                "type": "boolean"
              },
              "empty": {
                "type": "boolean"
              }
            }
          },
          "ApiResponseListBadgeProgressDTO": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/BadgeProgressDTO"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "BadgeProgressDTO": {
            "type": "object",
            "properties": {
              "badgeKey": {
                "type": "string"
              },
              "badgeName": {
                "type": "string"
              },
              "iconEmoji": {
                "type": "string"
              },
              "currentValue": {
                "type": "integer",
                "format": "int32"
              },
              "requiredValue": {
                "type": "integer",
                "format": "int32"
              },
              "percentComplete": {
                "type": "number",
                "format": "double"
              },
              "description": {
                "type": "string"
              }
            }
          },
          "ApiResponseListBadgeDTO": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/BadgeDTO"
                }
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          },
          "ApiResponseInteger": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              },
              "data": {
                "type": "integer",
                "format": "int32"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          }
        },
        "securitySchemes": {
          "Bearer [JWT_REDACTED]": {
            "type": "http",
            "description": "Nhập JWT token để xác thực",
            "scheme": "bearer",
            "bearerFormat": "JWT"
          }
        }
      }
    },
    "text": "{\"openapi\":\"[JWT_REDACTED]\",\"info\":{\"title\":\"English Learning Platform API\",\"description\":\"RESTful API cho hệ thống học tiếng Anh trực tuyến dành cho học sinh lớp 6\",\"contact\":{\"name\":\"English Learning Team\",\"url\":\"https://englishlearn.vn\",\"email\":\"support@englishlearn.vn\"},\"license\":{\"name\":\"MIT License\",\"url\":\"https://opensource.org/licenses/MIT\"},\"version\":\"[JWT_REDACTED]\"},\"servers\":[{\"url\":\"http://localhost:8080\",\"description\":\"Development Server\"},{\"url\":\"https://[JWT_REDACTED]\",\"description\":\"Production Server\"}],\"security\":[{\"Bearer [JWT_REDACTED]\":[]}],\"tags\":[{\"name\":\"Learning Path\",\"description\":\"Personalized learning path — ML-ready with rule-based fallback\"},{\"name\":\"Mistake Notebook\",\"description\":\"API quản lý sổ tay lỗi sai từ vựng\"},{\"name\":\"Dashboard\",\"description\":\"API cho bảng điều khiển thống kê\"},{\"name\":\"School Management\",\"description\":\"APIs for managing schools\"},{\"name\":\"SRS\",\"description\":\"Spaced Repetition System — SM-2 algorithm flashcard review\"},{\"name\":\"Public\",\"description\":\"APIs công khai (không cần đăng nhập)\"},{\"name\":\"Events\",\"description\":\"Behavioral event tracking — batch REST API, Kafka-ready contract\"},{\"name\":\"Badges\",\"description\":\"API quản lý huy hiệu\"},{\"name\":\"ClassRoom Management\",\"description\":\"APIs for managing classrooms\"},{\"name\":\"Notifications\",\"description\":\"API quản lý thông báo\"},{\"name\":\"Leaderboard\",\"description\":\"API bảng xếp hạng\"},{\"name\":\"Vocabulary\",\"description\":\"APIs for vocabulary and flashcards\"},{\"name\":\"Learning Profile\",\"description\":\"APIs cá nhân hoá học tập — onboarding, level theo skill, goals\"},{\"name\":\"Topics\",\"description\":\"APIs for topic-based vocabulary learning\"},{\"name\":\"Placement\",\"description\":\"Adaptive placement test — xác định CEFR level theo 4 kỹ năng\"},{\"name\":\"Lessons\",\"description\":\"API quản lý bài học\"},{\"name\":\"Question Management\",\"description\":\"APIs for managing questions\"},{\"name\":\"LLM\",\"description\":\"LLM-powered writing feedback — Phase 4\"},{\"name\":\"Exam Management\",\"description\":\"APIs for managing exams\"},{\"name\":\"Test Notifications\",\"description\":\"API để test thông báo real-time\"},{\"name\":\"Progress\",\"description\":\"APIs for tracking learning progress\"},{\"name\":\"Authentication\",\"description\":\"API xác thực người dùng\"},{\"name\":\"Daily Quests\",\"description\":\"API quản lý nhiệm vụ hàng ngày\"},{\"name\":\"Users\",\"description\":\"API quản lý người dùng\"},{\"name\":\"Recommendations\",\"description\":\"Rule-based daily recommendations + nightly weakness analysis\"}],\"paths\":{\"/api/v1/vocabulary/{id}\":{\"get\":{\"tags\":[\"Vocabulary\"],\"summary\":\"Get vocabulary by ID\",\"operationId\":\"getVocabularyById\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVocabularyResponse\"}}}}}},\"put\":{\"tags\":[\"Vocabulary\"],\"summary\":\"Cập nhật từ vựng\",\"operationId\":\"updateVocabulary\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/VocabularyRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVocabularyResponse\"}}}}}},\"delete\":{\"tags\":[\"Vocabulary\"],\"summary\":\"Xóa từ vựng\",\"operationId\":\"deleteVocabulary\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/users/{id}\":{\"get\":{\"tags\":[\"Users\"],\"summary\":\"Lấy thông tin người dùng theo ID\",\"operationId\":\"getById\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseUserResponse\"}}}}}},\"put\":{\"tags\":[\"Users\"],\"summary\":\"Cập nhật người dùng theo ID\",\"operationId\":\"updateUser\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/UpdateUserRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseUserResponse\"}}}}}},\"delete\":{\"tags\":[\"Users\"],\"summary\":\"Xóa người dùng\",\"operationId\":\"deleteUser\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/users/me/settings\":{\"get\":{\"tags\":[\"Users\"],\"summary\":\"Lấy cài đặt cá nhân cho trang settings\",\"operationId\":\"getMySettings\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseUserSettingsResponse\"}}}}}},\"put\":{\"tags\":[\"Users\"],\"summary\":\"Cập nhật cài đặt cá nhân cho trang settings\",\"operationId\":\"updateMySettings\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/UpdateUserSettingsRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseUserSettingsResponse\"}}}}}}},\"/api/v1/schools/{id}\":{\"get\":{\"tags\":[\"School Management\"],\"summary\":\"Get school by ID\",\"operationId\":\"getSchoolById\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseSchoolResponse\"}}}}}},\"put\":{\"tags\":[\"School Management\"],\"summary\":\"Update a school\",\"operationId\":\"updateSchool\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/SchoolRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseSchoolResponse\"}}}}}},\"delete\":{\"tags\":[\"School Management\"],\"summary\":\"Soft delete a school\",\"description\":\"Admin only\",\"operationId\":\"deleteSchool\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/questions/{id}\":{\"get\":{\"tags\":[\"Question Management\"],\"summary\":\"Get question by ID\",\"operationId\":\"getQuestionById\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseQuestionResponse\"}}}}}},\"put\":{\"tags\":[\"Question Management\"],\"summary\":\"Update a question\",\"operationId\":\"updateQuestion\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/QuestionRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseQuestionResponse\"}}}}}},\"delete\":{\"tags\":[\"Question Management\"],\"summary\":\"Delete a question\",\"operationId\":\"deleteQuestion\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/notifications/me/{id}/read\":{\"put\":{\"tags\":[\"Notifications\"],\"summary\":\"Đánh dấu thông báo là đã đọc của người dùng hiện tại\",\"operationId\":\"markMyNotificationAsRead\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/notifications/me/read-all\":{\"put\":{\"tags\":[\"Notifications\"],\"summary\":\"Đánh dấu tất cả thông báo của người dùng hiện tại là đã đọc\",\"operationId\":\"markAllAsReadMe\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/lessons/{id}\":{\"get\":{\"tags\":[\"Lessons\"],\"summary\":\"Lấy bài học theo ID\",\"operationId\":\"getById_1\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"description\":\"ID của bài học\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseLessonResponse\"}}}}}},\"put\":{\"tags\":[\"Lessons\"],\"summary\":\"Cập nhật bài học\",\"operationId\":\"update\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/LessonRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseLessonResponse\"}}}}}},\"delete\":{\"tags\":[\"Lessons\"],\"summary\":\"Xóa bài học\",\"operationId\":\"delete\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/learning-profile/me\":{\"get\":{\"tags\":[\"Learning Profile\"],\"summary\":\"Lấy profile học tập của user hiện tại\",\"operationId\":\"getMyProfile\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseLearningProfileResponse\"}}}}}},\"put\":{\"tags\":[\"Learning Profile\"],\"summary\":\"Cập nhật profile học tập (goals, daily target, topics)\",\"operationId\":\"updateProfile\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/UpdateLearningProfileRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseLearningProfileResponse\"}}}}}}},\"/api/v1/exams/{id}\":{\"get\":{\"tags\":[\"Exam Management\"],\"summary\":\"Get exam by ID (teacher/admin view - shows correct answers)\",\"operationId\":\"getExamById\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseExamResponse\"}}}}}},\"put\":{\"tags\":[\"Exam Management\"],\"summary\":\"Update an exam\",\"operationId\":\"updateExam\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/ExamRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseExamResponse\"}}}}}},\"delete\":{\"tags\":[\"Exam Management\"],\"summary\":\"Delete an exam\",\"operationId\":\"deleteExam\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/classes/{id}\":{\"get\":{\"tags\":[\"ClassRoom Management\"],\"summary\":\"Get classroom by ID\",\"operationId\":\"getClassRoomById\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseClassRoomResponse\"}}}}}},\"put\":{\"tags\":[\"ClassRoom Management\"],\"summary\":\"Update a classroom\",\"operationId\":\"updateClassRoom\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/ClassRoomRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseClassRoomResponse\"}}}}}},\"delete\":{\"tags\":[\"ClassRoom Management\"],\"summary\":\"Soft delete a classroom\",\"operationId\":\"deleteClassRoom\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/vocabulary\":{\"post\":{\"tags\":[\"Vocabulary\"],\"summary\":\"Tạo từ vựng mới\",\"operationId\":\"createVocabulary\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/VocabularyRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVocabularyResponse\"}}}}}}},\"/api/v1/vocabulary/review\":{\"post\":{\"tags\":[\"Vocabulary\"],\"summary\":\"Review a vocabulary word (correct/wrong)\",\"operationId\":\"reviewWord\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"type\":\"object\",\"additionalProperties\":{\"type\":\"object\"}}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseMapStringObject\"}}}}}}},\"/api/v1/users\":{\"get\":{\"tags\":[\"Users\"],\"summary\":\"Lấy danh sách người dùng (phân trang)\",\"operationId\":\"getAll\",\"parameters\":[{\"name\":\"pageable\",\"in\":\"query\",\"required\":true,\"schema\":{\"$ref\":\"#/components/schemas/Pageable\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponsePageUserResponse\"}}}}}},\"post\":{\"tags\":[\"Users\"],\"summary\":\"Tạo người dùng mới\",\"operationId\":\"createUser\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/CreateUserRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseUserResponse\"}}}}}}},\"/api/v1/users/{id}/coins\":{\"post\":{\"tags\":[\"Users\"],\"summary\":\"Thêm xu cho người dùng\",\"operationId\":\"addCoins\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"amount\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int32\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/test-notifications/send/{userId}\":{\"post\":{\"tags\":[\"Test Notifications\"],\"summary\":\"Gửi thông báo test cho user cụ thể (chỉ ADMIN hoặc SYSTEM)\",\"operationId\":\"sendTest\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"title\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"string\"}},{\"name\":\"message\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"string\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseString\"}}}}}}},\"/api/v1/srs/review\":{\"post\":{\"tags\":[\"SRS\"],\"summary\":\"Submit review với quality 0–5 — SM-2 cập nhật schedule tự động\",\"operationId\":\"submitReview\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/SrsReviewRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseSrsDueResponse\"}}}}}}},\"/api/v1/schools\":{\"get\":{\"tags\":[\"School Management\"],\"summary\":\"Get all schools\",\"description\":\"Retrieve all schools (Admin/School only)\",\"operationId\":\"getAllSchools\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListSchoolResponse\"}}}}}},\"post\":{\"tags\":[\"School Management\"],\"summary\":\"Create a new school\",\"description\":\"Admin only\",\"operationId\":\"createSchool\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/SchoolRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseSchoolResponse\"}}}}}}},\"/api/v1/quests\":{\"post\":{\"tags\":[\"Daily Quests\"],\"summary\":\"Tạo quest mới với tasks tùy chỉnh\",\"operationId\":\"createQuest\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/DailyQuestRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseDailyQuestResponse\"}}}}}}},\"/api/v1/quests/complete\":{\"post\":{\"tags\":[\"Daily Quests\"],\"summary\":\"Hoàn thành quest hôm nay\",\"operationId\":\"completeQuest\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseDailyQuestResponse\"}}}}}}},\"/api/v1/questions\":{\"get\":{\"tags\":[\"Question Management\"],\"summary\":\"Get all questions\",\"operationId\":\"getAllQuestions\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListQuestionResponse\"}}}}}},\"post\":{\"tags\":[\"Question Management\"],\"summary\":\"Create a new question\",\"operationId\":\"createQuestion\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/QuestionRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseQuestionResponse\"}}}}}}},\"/api/v1/progress/user/{userId}/lesson/{lessonId}\":{\"get\":{\"tags\":[\"Progress\"],\"summary\":\"Lấy tiến độ bài học cụ thể của user (Teacher/Admin)\",\"operationId\":\"getProgressForLesson\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"lessonId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseProgressResponse\"}}}}}},\"post\":{\"tags\":[\"Progress\"],\"summary\":\"Cập nhật tiến độ bài học cho user (Teacher/Admin)\",\"operationId\":\"updateProgress\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"lessonId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"percentage\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int32\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseProgressResponse\"}}}}}}},\"/api/v1/progress/user/{userId}/lesson/{lessonId}/complete\":{\"post\":{\"tags\":[\"Progress\"],\"summary\":\"Đánh dấu bài học hoàn thành cho user (Teacher/Admin)\",\"operationId\":\"completeLesson\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"lessonId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseProgressResponse\"}}}}}}},\"/api/v1/progress/me/lesson/{lessonId}\":{\"get\":{\"tags\":[\"Progress\"],\"summary\":\"Lấy tiến độ bài học cụ thể của user hiện tại\",\"operationId\":\"getMyProgressForLesson\",\"parameters\":[{\"name\":\"lessonId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseProgressResponse\"}}}}}},\"post\":{\"tags\":[\"Progress\"],\"summary\":\"Cập nhật tiến độ bài học cho user hiện tại\",\"operationId\":\"updateMyProgress\",\"parameters\":[{\"name\":\"lessonId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"percentage\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int32\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseProgressResponse\"}}}}}}},\"/api/v1/progress/me/lesson/{lessonId}/complete\":{\"post\":{\"tags\":[\"Progress\"],\"summary\":\"Đánh dấu bài học hoàn thành cho user hiện tại\",\"operationId\":\"completeMyLesson\",\"parameters\":[{\"name\":\"lessonId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseProgressResponse\"}}}}}}},\"/api/v1/placement/session\":{\"post\":{\"tags\":[\"Placement\"],\"summary\":\"Tạo placement session mới, trả về sessionId\",\"operationId\":\"createSession\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponsePlacementSessionResponse\"}}}}}}},\"/api/v1/placement/answer\":{\"post\":{\"tags\":[\"Placement\"],\"summary\":\"Submit đáp án — trả kết quả cuối nếu hoàn thành\",\"operationId\":\"submitAnswer\",\"parameters\":[{\"name\":\"sessionId\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"string\"}}],\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/PlacementAnswerRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponsePlacementAnswerAccepted\"}}}}}}},\"/api/v1/notifications/send/{userId}\":{\"post\":{\"tags\":[\"Notifications\"],\"summary\":\"Gửi thông báo trực tiếp cho một người dùng\",\"operationId\":\"sendNotification\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"title\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"string\"}},{\"name\":\"message\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"string\"}},{\"name\":\"imageUrl\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"string\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/notifications/broadcast\":{\"post\":{\"tags\":[\"Notifications\"],\"summary\":\"Gửi thông báo đến một nhóm người dùng (Toàn bộ, Vai trò, Trường học, Lớp học)\",\"operationId\":\"broadcastNotification\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/BroadcastNotificationRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/mistakes\":{\"post\":{\"tags\":[\"Mistake Notebook\"],\"summary\":\"Thêm lỗi sai vào sổ tay (tự động gắn userId của người dùng hiện tại)\",\"operationId\":\"addMistake\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/MistakeNotebookRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseMistakeNotebookDTO\"}}}}}}},\"/api/v1/llm/writing-feedback\":{\"post\":{\"tags\":[\"LLM\"],\"summary\":\"Sinh personalized feedback cho bài viết dựa trên CEFR level + weak areas của user\",\"operationId\":\"getWritingFeedback\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/WritingFeedbackRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseString\"}}}}}}},\"/api/v1/lessons\":{\"get\":{\"tags\":[\"Lessons\"],\"summary\":\"Lọc bài học theo độ khó\",\"operationId\":\"getAll_1_1_1_1_1\",\"parameters\":[{\"name\":\"pageable\",\"in\":\"query\",\"required\":true,\"schema\":{\"$ref\":\"#/components/schemas/Pageable\"}},{\"name\":\"topicId\",\"in\":\"query\",\"description\":\"ID của chủ đề\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"difficultyLevel\",\"in\":\"query\",\"description\":\"Độ khó (1-5)\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int32\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponsePageLessonResponse\"}}}}}},\"post\":{\"tags\":[\"Lessons\"],\"summary\":\"Tạo bài học mới\",\"operationId\":\"create\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/LessonRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseLessonResponse\"}}}}}}},\"/api/v1/learning-profile/onboarding\":{\"post\":{\"tags\":[\"Learning Profile\"],\"summary\":\"Hoàn tất onboarding: thiết lập goals + time commitment + topics\",\"operationId\":\"completeOnboarding\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/CompleteOnboardingRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseLearningProfileResponse\"}}}}}}},\"/api/v1/exams\":{\"get\":{\"tags\":[\"Exam Management\"],\"summary\":\"Lấy danh sách bài thi (Admin lấy hết, School lấy theo trường)\",\"operationId\":\"getAll_1\",\"parameters\":[{\"name\":\"pageable\",\"in\":\"query\",\"required\":true,\"schema\":{\"$ref\":\"#/components/schemas/Pageable\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponsePageExamResponse\"}}}}}},\"post\":{\"tags\":[\"Exam Management\"],\"summary\":\"Create a new exam\",\"operationId\":\"createExam\",\"parameters\":[{\"name\":\"teacherId\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/ExamRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseExamResponse\"}}}}}}},\"/api/v1/exams/{id}/publish\":{\"post\":{\"tags\":[\"Exam Management\"],\"summary\":\"Publish an exam\",\"operationId\":\"publishExam\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseExamResponse\"}}}}}}},\"/api/v1/exams/{id}/publish-scores\":{\"post\":{\"tags\":[\"Exam Management\"],\"summary\":\"Publish exam scores for students\",\"operationId\":\"publishScores\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseExamResponse\"}}}}}}},\"/api/v1/exams/{id}/close\":{\"post\":{\"tags\":[\"Exam Management\"],\"summary\":\"Close an exam\",\"operationId\":\"closeExam\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseExamResponse\"}}}}}}},\"/api/v1/exams/{examId}/submit-anticheat\":{\"post\":{\"tags\":[\"Exam Management\"],\"summary\":\"Nộp bài thi (với kiểm tra thời gian và anti-cheat)\",\"operationId\":\"submitExamWithAntiCheat\",\"parameters\":[{\"name\":\"examId\",\"in\":\"path\",\"description\":\"ID của bài thi\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/ExamSubmitDTO\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseExamResultDTO\"}}}}}}},\"/api/v1/exams/{examId}/start\":{\"post\":{\"tags\":[\"Exam Management\"],\"summary\":\"Bắt đầu làm bài thi (có shuffle câu hỏi/đáp án, tạo phiên thi)\",\"operationId\":\"startExam\",\"parameters\":[{\"name\":\"examId\",\"in\":\"path\",\"description\":\"ID của bài thi\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"studentId\",\"in\":\"query\",\"description\":\"ID của sinh viên\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseExamTakeDTO\"}}}}}}},\"/api/v1/exams/{examId}/anti-cheat-event\":{\"post\":{\"tags\":[\"Exam Management\"],\"summary\":\"Ghi nhận sự kiện chống gian lận (tab switch, copy/paste, v.v.)\",\"operationId\":\"logAntiCheatEvent\",\"parameters\":[{\"name\":\"examId\",\"in\":\"path\",\"description\":\"ID của bài thi\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/AntiCheatEventDTO\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/exams/submit\":{\"post\":{\"tags\":[\"Exam Management\"],\"summary\":\"Submit exam answers\",\"operationId\":\"submitExam\",\"parameters\":[{\"name\":\"studentId\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/SubmitExamRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseExamResultResponse\"}}}}}}},\"/api/v1/events/batch\":{\"post\":{\"tags\":[\"Events\"],\"summary\":\"Track batch of behavioral events (Kafka-ready contract)\",\"operationId\":\"trackBatch\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/BatchEventRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseMapStringObject\"}}}}}}},\"/api/v1/classes\":{\"get\":{\"tags\":[\"ClassRoom Management\"],\"summary\":\"Get all classrooms\",\"operationId\":\"getAllClassRooms\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListClassRoomResponse\"}}}}}},\"post\":{\"tags\":[\"ClassRoom Management\"],\"summary\":\"Create a new classroom\",\"operationId\":\"createClassRoom\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/ClassRoomRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseClassRoomResponse\"}}}}}}},\"/api/v1/classes/{classId}/teacher/{teacherId}\":{\"post\":{\"tags\":[\"ClassRoom Management\"],\"summary\":\"Assign a teacher to classroom\",\"operationId\":\"assignTeacher\",\"parameters\":[{\"name\":\"classId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"teacherId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/classes/{classId}/students/{studentId}\":{\"post\":{\"tags\":[\"ClassRoom Management\"],\"summary\":\"Add a student to classroom\",\"operationId\":\"addStudentToClass\",\"parameters\":[{\"name\":\"classId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"studentId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}},\"delete\":{\"tags\":[\"ClassRoom Management\"],\"summary\":\"Remove a student from classroom\",\"operationId\":\"removeStudentFromClass\",\"parameters\":[{\"name\":\"classId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"studentId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/badges\":{\"post\":{\"tags\":[\"Badges\"],\"summary\":\"Tạo huy hiệu mới (Admin)\",\"operationId\":\"createBadge\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/BadgeRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseBadgeResponse\"}}}}}}},\"/api/v1/badges/{userId}/check-achievements\":{\"post\":{\"tags\":[\"Badges\"],\"summary\":\"Kiểm tra và cấp huy hiệu achievements (Admin/School/System)\",\"operationId\":\"checkAndAwardAchievements\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListBadgeResponse\"}}}}}}},\"/api/v1/badges/{userId}/award/{badgeName}\":{\"post\":{\"tags\":[\"Badges\"],\"summary\":\"Cấp huy hiệu cho user (Admin/School/Teacher)\",\"operationId\":\"awardBadge\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"badgeName\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"string\"}},{\"name\":\"description\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"string\"}},{\"name\":\"iconUrl\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"string\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseBadgeResponse\"}}}}}}},\"/api/v1/badges/me/check\":{\"post\":{\"tags\":[\"Badges\"],\"summary\":\"Kiểm tra và trao badge cho chính mình, trả về badge mới đạt được\",\"operationId\":\"checkAndAwardBadgesForMe\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseCheckBadgeResponse\"}}}}}}},\"/api/v1/auth/reset-password\":{\"post\":{\"tags\":[\"Authentication\"],\"summary\":\"Reset mật khẩu bằng mã OTP\",\"operationId\":\"resetPassword\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/ResetPasswordRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/auth/register\":{\"post\":{\"tags\":[\"Authentication\"],\"summary\":\"Đăng ký tài khoản mới\",\"operationId\":\"register\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/RegisterRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseAuthResponse\"}}}}}}},\"/api/v1/auth/refresh-token\":{\"post\":{\"tags\":[\"Authentication\"],\"summary\":\"Làm mới access token bằng refresh token\",\"operationId\":\"refreshToken\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"type\":\"object\",\"additionalProperties\":{\"type\":\"string\"}}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseAuthResponse\"}}}}}}},\"/api/v1/auth/logout\":{\"post\":{\"tags\":[\"Authentication\"],\"summary\":\"Đăng xuất\",\"operationId\":\"logout\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/auth/login\":{\"post\":{\"tags\":[\"Authentication\"],\"summary\":\"Đăng nhập\",\"operationId\":\"login\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/LoginRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseAuthResponse\"}}}}}}},\"/api/v1/auth/google\":{\"post\":{\"tags\":[\"Authentication\"],\"summary\":\"Đăng nhập bằng Google\",\"operationId\":\"googleLogin\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/GoogleLoginRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseAuthResponse\"}}}}}}},\"/api/v1/auth/forgot-password\":{\"post\":{\"tags\":[\"Authentication\"],\"summary\":\"Quên mật khẩu - Gửi OTP về email\",\"operationId\":\"forgotPassword\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/ForgotPasswordRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/users/me\":{\"get\":{\"tags\":[\"Users\"],\"summary\":\"Lấy thông tin người dùng hiện tại\",\"operationId\":\"getCurrentUser\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseUserResponse\"}}}}}},\"patch\":{\"tags\":[\"Users\"],\"summary\":\"Cập nhật thông tin cá nhân\",\"operationId\":\"updateProfile_1\",\"parameters\":[{\"name\":\"fullName\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"string\"}},{\"name\":\"avatarUrl\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"string\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseUserResponse\"}}}}}}},\"/api/v1/users/me/password\":{\"patch\":{\"tags\":[\"Users\"],\"summary\":\"Đổi mật khẩu\",\"operationId\":\"changePassword\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/ChangePasswordRequest\"}}},\"required\":true},\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/quests/tasks/{taskId}\":{\"patch\":{\"tags\":[\"Daily Quests\"],\"summary\":\"Cập nhật tiến độ hoàn thành của task\",\"operationId\":\"updateTaskProgress\",\"parameters\":[{\"name\":\"taskId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"progress\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int32\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseDailyQuestResponse\"}}}}}}},\"/api/v1/vocabulary/topic/{topicId}\":{\"get\":{\"tags\":[\"Vocabulary\"],\"summary\":\"Get vocabulary by topic\",\"operationId\":\"getVocabularyByTopic\",\"parameters\":[{\"name\":\"topicId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListVocabularyResponse\"}}}}}}},\"/api/v1/vocabulary/search\":{\"get\":{\"tags\":[\"Vocabulary\"],\"summary\":\"Search vocabulary\",\"operationId\":\"searchVocabulary\",\"parameters\":[{\"name\":\"keyword\",\"in\":\"query\",\"required\":true,\"schema\":{\"maxLength\":100,\"minLength\":1,\"type\":\"string\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListVocabularyResponse\"}}}}}}},\"/api/v1/vocabulary/lesson/{lessonId}\":{\"get\":{\"tags\":[\"Vocabulary\"],\"summary\":\"Get vocabulary by lesson\",\"operationId\":\"getVocabularyByLesson\",\"parameters\":[{\"name\":\"lessonId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListVocabularyResponse\"}}}}}}},\"/api/v1/vocabulary/lesson/{lessonId}/paged\":{\"get\":{\"tags\":[\"Vocabulary\"],\"summary\":\"Get vocabulary by lesson with pagination\",\"operationId\":\"getVocabularyByLessonPaged\",\"parameters\":[{\"name\":\"lessonId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"pageable\",\"in\":\"query\",\"required\":true,\"schema\":{\"$ref\":\"#/components/schemas/Pageable\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponsePageVocabularyResponse\"}}}}}}},\"/api/v1/vocabulary/learned\":{\"get\":{\"tags\":[\"Vocabulary\"],\"summary\":\"Get all mastered vocabulary for current user\",\"operationId\":\"getLearnedWords\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListVocabularyResponse\"}}}}}}},\"/api/v1/vocabulary/learned/count\":{\"get\":{\"tags\":[\"Vocabulary\"],\"summary\":\"Get mastered vocabulary count for current user\",\"operationId\":\"getLearnedCount\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseLong\"}}}}}}},\"/api/v1/vocabulary/flashcards/{lessonId}\":{\"get\":{\"tags\":[\"Vocabulary\"],\"summary\":\"Get flashcards for lesson\",\"operationId\":\"getFlashcards\",\"parameters\":[{\"name\":\"lessonId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"count\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"integer\",\"format\":\"int32\",\"default\":10}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListVocabularyResponse\"}}}}}}},\"/api/v1/vocabulary/flashcards/random\":{\"get\":{\"tags\":[\"Vocabulary\"],\"summary\":\"Get random flashcards\",\"operationId\":\"getRandomFlashcards\",\"parameters\":[{\"name\":\"count\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"integer\",\"format\":\"int32\",\"default\":10}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListVocabularyResponse\"}}}}}}},\"/api/v1/users/teachers\":{\"get\":{\"tags\":[\"Users\"],\"summary\":\"Tìm kiếm giáo viên\",\"operationId\":\"searchTeachers\",\"parameters\":[{\"name\":\"keyword\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"string\",\"default\":\"\"}},{\"name\":\"pageable\",\"in\":\"query\",\"required\":true,\"schema\":{\"$ref\":\"#/components/schemas/Pageable\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponsePageUserResponse\"}}}}}}},\"/api/v1/users/students\":{\"get\":{\"tags\":[\"Users\"],\"summary\":\"Tìm kiếm học sinh\",\"operationId\":\"searchStudents\",\"parameters\":[{\"name\":\"keyword\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"string\",\"default\":\"\"}},{\"name\":\"pageable\",\"in\":\"query\",\"required\":true,\"schema\":{\"$ref\":\"#/components/schemas/Pageable\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponsePageUserResponse\"}}}}}}},\"/api/v1/users/stats\":{\"get\":{\"tags\":[\"Users\"],\"summary\":\"Lấy thống kê người dùng (Admin only)\",\"operationId\":\"getUserStats\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseAdminUserStatsResponse\"}}}}}}},\"/api/v1/users/me/audit-logs\":{\"get\":{\"tags\":[\"Users\"],\"summary\":\"Lấy nhật ký hoạt động của mình\",\"operationId\":\"getMyAuditLogs\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListAuditLogResponse\"}}}}}}},\"/api/v1/topics\":{\"get\":{\"tags\":[\"Topics\"],\"summary\":\"Lấy tất cả chủ đề với tiến độ học tập của user hiện tại\",\"operationId\":\"getTopicsWithProgress\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListMapStringObject\"}}}}}}},\"/api/v1/topics/{topicId}/lessons\":{\"get\":{\"tags\":[\"Topics\"],\"summary\":\"Lấy danh sách bài học theo chủ đề\",\"operationId\":\"getLessonsByTopic\",\"parameters\":[{\"name\":\"topicId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListLessonResponse\"}}}}}}},\"/api/v1/topics/{topicId}/learn\":{\"get\":{\"tags\":[\"Topics\"],\"summary\":\"Lấy tối đa 20 từ chưa thành thạo cho một chủ đề của user hiện tại\",\"operationId\":\"getWordsToLearn\",\"parameters\":[{\"name\":\"topicId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListVocabularyResponse\"}}}}}}},\"/api/v1/srs/due-today\":{\"get\":{\"tags\":[\"SRS\"],\"summary\":\"Lấy danh sách flashcard cần ôn hôm nay (đã sort theo overdue + EF)\",\"operationId\":\"getDueToday\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseSrsDueResponse\"}}}}}}},\"/api/v1/schools/search\":{\"get\":{\"tags\":[\"School Management\"],\"summary\":\"Search schools by name\",\"operationId\":\"searchSchools\",\"parameters\":[{\"name\":\"name\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"string\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListSchoolResponse\"}}}}}}},\"/api/v1/schools/active\":{\"get\":{\"tags\":[\"School Management\"],\"summary\":\"Get active schools with pagination\",\"operationId\":\"getActiveSchools\",\"parameters\":[{\"name\":\"pageable\",\"in\":\"query\",\"required\":true,\"schema\":{\"$ref\":\"#/components/schemas/Pageable\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponsePageSchoolResponse\"}}}}}}},\"/api/v1/recommendations/daily\":{\"get\":{\"tags\":[\"Recommendations\"],\"summary\":\"Lấy bài học được cá nhân hoá cho hôm nay — ưu tiên weak skills → topic → level\",\"operationId\":\"getDailyRecommendations\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseRecommendationResponse\"}}}}}}},\"/api/v1/quests/today\":{\"get\":{\"tags\":[\"Daily Quests\"],\"summary\":\"Lấy quest của hôm nay\",\"operationId\":\"getTodayQuest\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseDailyQuestResponse\"}}}}}}},\"/api/v1/quests/history\":{\"get\":{\"tags\":[\"Daily Quests\"],\"summary\":\"Lấy lịch sử quests\",\"operationId\":\"getQuestHistory\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListDailyQuestResponse\"}}}}}}},\"/api/v1/questions/type/{type}\":{\"get\":{\"tags\":[\"Question Management\"],\"summary\":\"Get questions by type\",\"operationId\":\"getQuestionsByType\",\"parameters\":[{\"name\":\"type\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"string\"}},{\"name\":\"pageable\",\"in\":\"query\",\"required\":true,\"schema\":{\"$ref\":\"#/components/schemas/Pageable\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponsePageQuestionResponse\"}}}}}}},\"/api/v1/questions/lesson/{lessonId}\":{\"get\":{\"tags\":[\"Question Management\"],\"summary\":\"Get questions by lesson\",\"operationId\":\"getQuestionsByLesson\",\"parameters\":[{\"name\":\"lessonId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListQuestionResponse\"}}}}}}},\"/api/v1/public/stats\":{\"get\":{\"tags\":[\"Public\"],\"summary\":\"Thống kê tổng quan (học sinh, bài học, từ vựng)\",\"operationId\":\"getPublicStats\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseMapStringLong\"}}}}}}},\"/api/v1/progress/user/{userId}\":{\"get\":{\"tags\":[\"Progress\"],\"summary\":\"Lấy tất cả tiến độ học tập của user (Teacher/Admin)\",\"operationId\":\"getProgressByUser\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListProgressResponse\"}}}}}}},\"/api/v1/progress/user/{userId}/stats\":{\"get\":{\"tags\":[\"Progress\"],\"summary\":\"Lấy thống kê học tập của user (Teacher/Admin)\",\"operationId\":\"getUserStats_1\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseMapStringObject\"}}}}}}},\"/api/v1/progress/user/{userId}/in-progress\":{\"get\":{\"tags\":[\"Progress\"],\"summary\":\"Lấy các bài học đang học của user (Teacher/Admin)\",\"operationId\":\"getInProgressLessons\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListProgressResponse\"}}}}}}},\"/api/v1/progress/user/{userId}/completed\":{\"get\":{\"tags\":[\"Progress\"],\"summary\":\"Lấy các bài học đã hoàn thành của user (Teacher/Admin)\",\"operationId\":\"getCompletedLessons\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListProgressResponse\"}}}}}}},\"/api/v1/progress/me\":{\"get\":{\"tags\":[\"Progress\"],\"summary\":\"Lấy tất cả tiến độ học tập của user hiện tại\",\"operationId\":\"getMyProgress\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListProgressResponse\"}}}}}}},\"/api/v1/progress/me/stats\":{\"get\":{\"tags\":[\"Progress\"],\"summary\":\"Lấy thống kê học tập của user hiện tại\",\"operationId\":\"getMyStats\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseMapStringObject\"}}}}}}},\"/api/v1/progress/me/in-progress\":{\"get\":{\"tags\":[\"Progress\"],\"summary\":\"Lấy các bài học đang học của user hiện tại\",\"operationId\":\"getMyInProgressLessons\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListProgressResponse\"}}}}}}},\"/api/v1/progress/me/completed\":{\"get\":{\"tags\":[\"Progress\"],\"summary\":\"Lấy các bài học đã hoàn thành của user hiện tại\",\"operationId\":\"getMyCompletedLessons\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListProgressResponse\"}}}}}}},\"/api/v1/placement/result\":{\"get\":{\"tags\":[\"Placement\"],\"summary\":\"Lấy kết quả placement (sau khi hoàn thành)\",\"operationId\":\"getResult\",\"parameters\":[{\"name\":\"sessionId\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"string\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponsePlacementResultResponse\"}}}}}}},\"/api/v1/placement/question\":{\"get\":{\"tags\":[\"Placement\"],\"summary\":\"Lấy câu hỏi tiếp theo (adaptive)\",\"operationId\":\"getNextQuestion\",\"parameters\":[{\"name\":\"sessionId\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"string\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponsePlacementQuestionResponse\"}}}}}}},\"/api/v1/notifications/me\":{\"get\":{\"tags\":[\"Notifications\"],\"summary\":\"Lấy danh sách thông báo của người dùng hiện tại\",\"operationId\":\"getMyNotifications\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListNotificationResponse\"}}}}}}},\"/api/v1/notifications/me/unread-count\":{\"get\":{\"tags\":[\"Notifications\"],\"summary\":\"Lấy số lượng thông báo chưa đọc của người dùng hiện tại\",\"operationId\":\"getMyUnreadCount\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseLong\"}}}}}}},\"/api/v1/mistakes/user/{userId}\":{\"get\":{\"tags\":[\"Mistake Notebook\"],\"summary\":\"Lấy danh sách lỗi sai của người dùng (Teacher/Admin)\",\"operationId\":\"getMistakesByUser\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"description\":\"ID của người dùng\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListMistakeNotebookDTO\"}}}}}}},\"/api/v1/mistakes/user/{userId}/top\":{\"get\":{\"tags\":[\"Mistake Notebook\"],\"summary\":\"Lấy top 10 lỗi sai nhiều nhất của người dùng (Teacher/Admin)\",\"operationId\":\"getTopMistakes\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"description\":\"ID của người dùng\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListMistakeNotebookDTO\"}}}}}}},\"/api/v1/mistakes/user/{userId}/count\":{\"get\":{\"tags\":[\"Mistake Notebook\"],\"summary\":\"Đếm số lỗi sai của người dùng (Teacher/Admin)\",\"operationId\":\"countMistakes\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"description\":\"ID của người dùng\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseLong\"}}}}}}},\"/api/v1/mistakes/me\":{\"get\":{\"tags\":[\"Mistake Notebook\"],\"summary\":\"Lấy danh sách lỗi sai của chính mình\",\"operationId\":\"getMyMistakes\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListMistakeNotebookDTO\"}}}}}}},\"/api/v1/mistakes/me/top\":{\"get\":{\"tags\":[\"Mistake Notebook\"],\"summary\":\"Lấy top 10 lỗi sai nhiều nhất của chính mình\",\"operationId\":\"getMyTopMistakes\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListMistakeNotebookDTO\"}}}}}}},\"/api/v1/mistakes/me/count\":{\"get\":{\"tags\":[\"Mistake Notebook\"],\"summary\":\"Đếm số lỗi sai của chính mình\",\"operationId\":\"countMyMistakes\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseLong\"}}}}}}},\"/api/v1/learning-profile/status\":{\"get\":{\"tags\":[\"Learning Profile\"],\"summary\":\"Kiểm tra đã hoàn thành onboarding chưa\",\"operationId\":\"getOnboardingStatus\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseLearningProfileStatusResponse\"}}}}}}},\"/api/v1/learning-path/recommended\":{\"get\":{\"tags\":[\"Learning Path\"],\"summary\":\"Lấy lộ trình học cá nhân — gọi ML service hoặc fallback rule-based\",\"operationId\":\"getRecommendedPath\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseLearningPathResponse\"}}}}}}},\"/api/v1/leaderboard/users/{userId}\":{\"get\":{\"tags\":[\"Leaderboard\"],\"summary\":\"Lấy vị trí (rank) của user theo ID\",\"operationId\":\"getUserRank\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"schoolId\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseLeaderboardResponse\"}}}}}}},\"/api/v1/leaderboard/top\":{\"get\":{\"tags\":[\"Leaderboard\"],\"summary\":\"Lấy top users theo coins\",\"operationId\":\"getTopUsers\",\"parameters\":[{\"name\":\"schoolId\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"limit\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"integer\",\"format\":\"int32\",\"default\":10}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListLeaderboardResponse\"}}}}}}},\"/api/v1/leaderboard/streak\":{\"get\":{\"tags\":[\"Leaderboard\"],\"summary\":\"Lấy bảng xếp hạng theo streak\",\"operationId\":\"getLeaderboardByStreak\",\"parameters\":[{\"name\":\"schoolId\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"limit\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"integer\",\"format\":\"int32\",\"default\":100}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListLeaderboardResponse\"}}}}}}},\"/api/v1/leaderboard/me\":{\"get\":{\"tags\":[\"Leaderboard\"],\"summary\":\"Lấy vị trí (rank) của user hiện tại\",\"operationId\":\"getMyRank\",\"parameters\":[{\"name\":\"schoolId\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseLeaderboardResponse\"}}}}}}},\"/api/v1/leaderboard/global\":{\"get\":{\"tags\":[\"Leaderboard\"],\"summary\":\"Lấy bảng xếp hạng tổng hợp (coins + streak)\",\"operationId\":\"getGlobalLeaderboard\",\"parameters\":[{\"name\":\"schoolId\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"limit\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"integer\",\"format\":\"int32\",\"default\":100}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListLeaderboardResponse\"}}}}}}},\"/api/v1/leaderboard/compare\":{\"get\":{\"tags\":[\"Leaderboard\"],\"summary\":\"So sánh vị trí của nhiều users\",\"operationId\":\"compareUsers\",\"parameters\":[{\"name\":\"schoolId\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"userIds\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"array\",\"items\":{\"type\":\"integer\",\"format\":\"int64\"}}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListLeaderboardResponse\"}}}}}}},\"/api/v1/leaderboard/coins\":{\"get\":{\"tags\":[\"Leaderboard\"],\"summary\":\"Lấy bảng xếp hạng theo coins\",\"operationId\":\"getLeaderboardByCoins\",\"parameters\":[{\"name\":\"schoolId\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"pageable\",\"in\":\"query\",\"required\":true,\"schema\":{\"$ref\":\"#/components/schemas/Pageable\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponsePageLeaderboardResponse\"}}}}}}},\"/api/v1/leaderboard/around-user/{userId}\":{\"get\":{\"tags\":[\"Leaderboard\"],\"summary\":\"Lấy bảng xếp hạng xung quanh vị trí user theo ID\",\"operationId\":\"getLeaderboardAroundUser\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"schoolId\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"rangeSize\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"integer\",\"format\":\"int32\",\"default\":10}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListLeaderboardResponse\"}}}}}}},\"/api/v1/leaderboard/around-me\":{\"get\":{\"tags\":[\"Leaderboard\"],\"summary\":\"Lấy bảng xếp hạng xung quanh vị trí user hiện tại\",\"operationId\":\"getLeaderboardAroundMe\",\"parameters\":[{\"name\":\"schoolId\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"rangeSize\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"integer\",\"format\":\"int32\",\"default\":10}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListLeaderboardResponse\"}}}}}}},\"/api/v1/exams/{id}/take\":{\"get\":{\"tags\":[\"Exam Management\"],\"summary\":\"Get exam for student to take - shuffles questions/answers, hides correct answers\",\"operationId\":\"getExamForStudent\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseExamResponse\"}}}}}}},\"/api/v1/exams/{id}/results\":{\"get\":{\"tags\":[\"Exam Management\"],\"summary\":\"Get exam results\",\"operationId\":\"getExamResults\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListExamResultResponse\"}}}}}}},\"/api/v1/exams/{id}/my-result\":{\"get\":{\"tags\":[\"Exam Management\"],\"summary\":\"Get current student's result for an exam\",\"operationId\":\"getMyExamResult\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseExamResultResponse\"}}}}}}},\"/api/v1/exams/teacher/{teacherId}\":{\"get\":{\"tags\":[\"Exam Management\"],\"summary\":\"Get exams by teacher\",\"operationId\":\"getExamsByTeacher\",\"parameters\":[{\"name\":\"teacherId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"pageable\",\"in\":\"query\",\"required\":true,\"schema\":{\"$ref\":\"#/components/schemas/Pageable\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponsePageExamResponse\"}}}}}}},\"/api/v1/exams/results/{examResultId}/anti-cheat-events\":{\"get\":{\"tags\":[\"Exam Management\"],\"summary\":\"Lấy lịch sử các sự kiện gian lận của một bài thi\",\"operationId\":\"getAntiCheatEvents\",\"parameters\":[{\"name\":\"examResultId\",\"in\":\"path\",\"description\":\"ID của kết quả thi\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListAntiCheatEvent\"}}}}}}},\"/api/v1/exams/class/{classId}\":{\"get\":{\"tags\":[\"Exam Management\"],\"summary\":\"Get exams by class\",\"operationId\":\"getExamsByClass\",\"parameters\":[{\"name\":\"classId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"pageable\",\"in\":\"query\",\"required\":true,\"schema\":{\"$ref\":\"#/components/schemas/Pageable\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponsePageExamResponse\"}}}}}}},\"/api/v1/exams/class/{classId}/active\":{\"get\":{\"tags\":[\"Exam Management\"],\"summary\":\"Get active exams for student\",\"operationId\":\"getActiveExams\",\"parameters\":[{\"name\":\"classId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListExamResponse\"}}}}}}},\"/api/v1/dashboard/stats\":{\"get\":{\"tags\":[\"Dashboard\"],\"summary\":\"Lấy toàn bộ thống kê hệ thống (Admin only)\",\"operationId\":\"getStats\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseDashboardStatsResponse\"}}}}}}},\"/api/v1/classes/{classId}/students\":{\"get\":{\"tags\":[\"ClassRoom Management\"],\"summary\":\"Get active students in classroom\",\"operationId\":\"getStudentsByClass\",\"parameters\":[{\"name\":\"classId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListClassStudentResponse\"}}}}}}},\"/api/v1/classes/{classId}/students/search\":{\"get\":{\"tags\":[\"ClassRoom Management\"],\"summary\":\"Search students by username/fullName/email to add into classroom\",\"operationId\":\"searchStudentsForClass\",\"parameters\":[{\"name\":\"classId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"keyword\",\"in\":\"query\",\"required\":true,\"schema\":{\"type\":\"string\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListClassStudentResponse\"}}}}}}},\"/api/v1/classes/teacher/{teacherId}\":{\"get\":{\"tags\":[\"ClassRoom Management\"],\"summary\":\"Get classrooms by teacher\",\"operationId\":\"getClassRoomsByTeacher\",\"parameters\":[{\"name\":\"teacherId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListClassRoomResponse\"}}}}}}},\"/api/v1/classes/student/{studentId}\":{\"get\":{\"tags\":[\"ClassRoom Management\"],\"summary\":\"Get classrooms by student\",\"operationId\":\"getClassRoomsByStudent\",\"parameters\":[{\"name\":\"studentId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListClassRoomResponse\"}}}}}}},\"/api/v1/classes/school/{schoolId}\":{\"get\":{\"tags\":[\"ClassRoom Management\"],\"summary\":\"Get classrooms by school\",\"operationId\":\"getClassRoomsBySchool\",\"parameters\":[{\"name\":\"schoolId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}},{\"name\":\"pageable\",\"in\":\"query\",\"required\":true,\"schema\":{\"$ref\":\"#/components/schemas/Pageable\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponsePageClassRoomResponse\"}}}}}}},\"/api/v1/badges/{badgeId}\":{\"get\":{\"tags\":[\"Badges\"],\"summary\":\"Lấy thông tin huy hiệu theo ID\",\"operationId\":\"getBadgeById\",\"parameters\":[{\"name\":\"badgeId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseBadgeResponse\"}}}}}},\"delete\":{\"tags\":[\"Badges\"],\"summary\":\"Xóa huy hiệu (Admin)\",\"operationId\":\"deleteBadge\",\"parameters\":[{\"name\":\"badgeId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/badges/users/{userId}\":{\"get\":{\"tags\":[\"Badges\"],\"summary\":\"Lấy danh sách huy hiệu của người dùng (Teacher/Admin)\",\"operationId\":\"getUserBadges\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListBadgeResponse\"}}}}}}},\"/api/v1/badges/users/{userId}/progress\":{\"get\":{\"tags\":[\"Badges\"],\"summary\":\"Lấy tiến trình badge chưa đạt của người dùng (Teacher/Admin)\",\"operationId\":\"getUserBadgeProgress\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListBadgeProgressDTO\"}}}}}}},\"/api/v1/badges/users/{userId}/earned\":{\"get\":{\"tags\":[\"Badges\"],\"summary\":\"Lấy badge đã đạt của người dùng (Teacher/Admin)\",\"operationId\":\"getUserEarnedBadges\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListBadgeDTO\"}}}}}}},\"/api/v1/badges/users/{userId}/count\":{\"get\":{\"tags\":[\"Badges\"],\"summary\":\"Đếm số huy hiệu của người dùng (Teacher/Admin)\",\"operationId\":\"getBadgeCount\",\"parameters\":[{\"name\":\"userId\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseInteger\"}}}}}}},\"/api/v1/badges/me\":{\"get\":{\"tags\":[\"Badges\"],\"summary\":\"Lấy danh sách huy hiệu của mình\",\"operationId\":\"getMyBadges\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListBadgeResponse\"}}}}}}},\"/api/v1/badges/me/progress\":{\"get\":{\"tags\":[\"Badges\"],\"summary\":\"Lấy tiến trình badge chưa đạt của chính mình\",\"operationId\":\"getMyBadgeProgress\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListBadgeProgressDTO\"}}}}}}},\"/api/v1/badges/me/earned\":{\"get\":{\"tags\":[\"Badges\"],\"summary\":\"Lấy badge đã đạt của chính mình\",\"operationId\":\"getMyEarnedBadges\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListBadgeDTO\"}}}}}}},\"/api/v1/badges/definitions\":{\"get\":{\"tags\":[\"Badges\"],\"summary\":\"Lấy danh sách badge definitions (có filter group) - PUBLIC\",\"operationId\":\"getBadgeDefinitions\",\"parameters\":[{\"name\":\"group\",\"in\":\"query\",\"required\":false,\"schema\":{\"type\":\"string\",\"enum\":[\"STREAK\",\"LESSON\",\"QUIZ\",\"LEVEL\",\"SPECIAL\",\"SOCIAL\"]}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseListBadgeDTO\"}}}}}}},\"/api/v1/auth/health\":{\"get\":{\"tags\":[\"Authentication\"],\"summary\":\"Kiểm tra trạng thái server\",\"operationId\":\"healthCheck\",\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"type\":\"object\"}}}}}}},\"/api/v1/schools/{id}/permanent\":{\"delete\":{\"tags\":[\"School Management\"],\"summary\":\"Permanently delete a school\",\"description\":\"Admin only - Use with caution\",\"operationId\":\"hardDeleteSchool\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/notifications/me/{id}\":{\"delete\":{\"tags\":[\"Notifications\"],\"summary\":\"Xóa thông báo của người dùng hiện tại\",\"operationId\":\"deleteMyNotification\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}},\"/api/v1/mistakes/{id}\":{\"delete\":{\"tags\":[\"Mistake Notebook\"],\"summary\":\"Xóa lỗi sai khỏi sổ tay (STUDENT chỉ xóa được của mình)\",\"operationId\":\"removeMistake\",\"parameters\":[{\"name\":\"id\",\"in\":\"path\",\"description\":\"ID của lỗi sai\",\"required\":true,\"schema\":{\"type\":\"integer\",\"format\":\"int64\"}}],\"responses\":{\"200\":{\"description\":\"OK\",\"content\":{\"*/*\":{\"schema\":{\"$ref\":\"#/components/schemas/ApiResponseVoid\"}}}}}}}},\"components\":{\"schemas\":{\"VocabularyRequest\":{\"required\":[\"lessonId\",\"meaning\",\"word\"],\"type\":\"object\",\"properties\":{\"lessonId\":{\"type\":\"integer\",\"format\":\"int64\"},\"word\":{\"type\":\"string\"},\"pronunciation\":{\"type\":\"string\"},\"meaning\":{\"type\":\"string\"},\"exampleSentence\":{\"type\":\"string\"},\"imageUrl\":{\"type\":\"string\"},\"audioUrl\":{\"type\":\"string\"}}},\"ApiResponseVocabularyResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/VocabularyResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"VocabularyResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"word\":{\"type\":\"string\"},\"pronunciation\":{\"type\":\"string\"},\"meaning\":{\"type\":\"string\"},\"exampleSentence\":{\"type\":\"string\"},\"imageUrl\":{\"type\":\"string\"},\"audioUrl\":{\"type\":\"string\"},\"lessonId\":{\"type\":\"integer\",\"format\":\"int64\"},\"lessonTitle\":{\"type\":\"string\"}}},\"UpdateUserRequest\":{\"type\":\"object\",\"properties\":{\"fullName\":{\"type\":\"string\"},\"email\":{\"type\":\"string\"},\"roles\":{\"uniqueItems\":true,\"type\":\"array\",\"items\":{\"type\":\"string\"}},\"isActive\":{\"type\":\"boolean\"},\"coins\":{\"type\":\"integer\",\"format\":\"int32\"},\"classId\":{\"type\":\"integer\",\"format\":\"int64\"}}},\"ApiResponseUserResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/UserResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"UserResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"username\":{\"type\":\"string\"},\"email\":{\"type\":\"string\"},\"fullName\":{\"type\":\"string\"},\"avatarUrl\":{\"type\":\"string\"},\"coins\":{\"type\":\"integer\",\"format\":\"int32\"},\"streakDays\":{\"type\":\"integer\",\"format\":\"int32\"},\"isActive\":{\"type\":\"boolean\"},\"roles\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}},\"schoolId\":{\"type\":\"integer\",\"format\":\"int64\"},\"schoolName\":{\"type\":\"string\"},\"classId\":{\"type\":\"integer\",\"format\":\"int64\"},\"className\":{\"type\":\"string\"},\"createdAt\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"UpdateUserSettingsRequest\":{\"type\":\"object\",\"properties\":{\"soundEffectsEnabled\":{\"type\":\"boolean\"},\"dailyRemindersEnabled\":{\"type\":\"boolean\"},\"prefersDarkMode\":{\"type\":\"boolean\"}}},\"ApiResponseUserSettingsResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/UserSettingsResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"UserSettingsResponse\":{\"type\":\"object\",\"properties\":{\"soundEffectsEnabled\":{\"type\":\"boolean\"},\"dailyRemindersEnabled\":{\"type\":\"boolean\"},\"prefersDarkMode\":{\"type\":\"boolean\"},\"totalStudyMinutes\":{\"type\":\"integer\",\"format\":\"int32\"},\"weeklyStudyMinutes\":{\"type\":\"integer\",\"format\":\"int32\"},\"weeklyGoalMinutes\":{\"type\":\"integer\",\"format\":\"int32\"}}},\"SchoolRequest\":{\"required\":[\"name\"],\"type\":\"object\",\"properties\":{\"name\":{\"maxLength\":200,\"minLength\":0,\"type\":\"string\"},\"address\":{\"maxLength\":500,\"minLength\":0,\"type\":\"string\"},\"phone\":{\"maxLength\":20,\"minLength\":0,\"type\":\"string\"},\"email\":{\"maxLength\":100,\"minLength\":0,\"type\":\"string\"},\"trialEndDate\":{\"type\":\"string\",\"format\":\"date\"},\"isActive\":{\"type\":\"boolean\"},\"managerUsername\":{\"type\":\"string\"},\"managerPassword\":{\"type\":\"string\"}}},\"ApiResponseSchoolResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/SchoolResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"SchoolResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"name\":{\"type\":\"string\"},\"address\":{\"type\":\"string\"},\"phone\":{\"type\":\"string\"},\"email\":{\"type\":\"string\"},\"isActive\":{\"type\":\"boolean\"},\"trialEndDate\":{\"type\":\"string\",\"format\":\"date\"},\"createdAt\":{\"type\":\"string\",\"format\":\"date-time\"},\"teacherCount\":{\"type\":\"integer\",\"format\":\"int64\"},\"studentCount\":{\"type\":\"integer\",\"format\":\"int64\"},\"classCount\":{\"type\":\"integer\",\"format\":\"int64\"}}},\"QuestionOptionRequest\":{\"required\":[\"optionText\"],\"type\":\"object\",\"properties\":{\"optionText\":{\"type\":\"string\"},\"isCorrect\":{\"type\":\"boolean\"}}},\"QuestionRequest\":{\"required\":[\"points\",\"questionText\",\"questionType\"],\"type\":\"object\",\"properties\":{\"lessonId\":{\"type\":\"integer\",\"format\":\"int64\"},\"vocabularyId\":{\"type\":\"integer\",\"format\":\"int64\"},\"questionType\":{\"maxLength\":50,\"minLength\":0,\"type\":\"string\"},\"questionText\":{\"type\":\"string\"},\"points\":{\"type\":\"integer\",\"format\":\"int32\"},\"explanation\":{\"type\":\"string\"},\"options\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/QuestionOptionRequest\"}}}},\"ApiResponseQuestionResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/QuestionResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"QuestionOptionResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"optionText\":{\"type\":\"string\"},\"isCorrect\":{\"type\":\"boolean\"}}},\"QuestionResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"questionType\":{\"type\":\"string\"},\"questionText\":{\"type\":\"string\"},\"points\":{\"type\":\"integer\",\"format\":\"int32\"},\"explanation\":{\"type\":\"string\"},\"lessonId\":{\"type\":\"integer\",\"format\":\"int64\"},\"lessonTitle\":{\"type\":\"string\"},\"vocabularyId\":{\"type\":\"integer\",\"format\":\"int64\"},\"vocabularyWord\":{\"type\":\"string\"},\"options\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/QuestionOptionResponse\"}}}},\"ApiResponseVoid\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"object\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"LessonRequest\":{\"required\":[\"title\"],\"type\":\"object\",\"properties\":{\"title\":{\"maxLength\":200,\"minLength\":0,\"type\":\"string\"},\"topicId\":{\"type\":\"integer\",\"format\":\"int64\"},\"contentHtml\":{\"type\":\"string\"},\"grammarHtml\":{\"type\":\"string\"},\"audioUrl\":{\"type\":\"string\"},\"videoUrl\":{\"type\":\"string\"},\"difficultyLevel\":{\"type\":\"integer\",\"format\":\"int32\"},\"orderIndex\":{\"type\":\"integer\",\"format\":\"int32\"},\"isPublished\":{\"type\":\"boolean\"}}},\"ApiResponseLessonResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/LessonResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"LessonResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"title\":{\"type\":\"string\"},\"topicId\":{\"type\":\"integer\",\"format\":\"int64\"},\"topicName\":{\"type\":\"string\"},\"contentHtml\":{\"type\":\"string\"},\"grammarHtml\":{\"type\":\"string\"},\"audioUrl\":{\"type\":\"string\"},\"videoUrl\":{\"type\":\"string\"},\"difficultyLevel\":{\"type\":\"integer\",\"format\":\"int32\"},\"orderIndex\":{\"type\":\"integer\",\"format\":\"int32\"},\"isPublished\":{\"type\":\"boolean\"},\"vocabularyCount\":{\"type\":\"integer\",\"format\":\"int32\"},\"questionCount\":{\"type\":\"integer\",\"format\":\"int32\"}}},\"UpdateLearningProfileRequest\":{\"type\":\"object\",\"properties\":{\"grammarLevel\":{\"type\":\"string\",\"enum\":[\"A1\",\"A2\",\"B1\",\"B2\",\"C1\",\"C2\"]},\"vocabularyLevel\":{\"type\":\"string\",\"enum\":[\"A1\",\"A2\",\"B1\",\"B2\",\"C1\",\"C2\"]},\"readingLevel\":{\"type\":\"string\",\"enum\":[\"A1\",\"A2\",\"B1\",\"B2\",\"C1\",\"C2\"]},\"listeningLevel\":{\"type\":\"string\",\"enum\":[\"A1\",\"A2\",\"B1\",\"B2\",\"C1\",\"C2\"]},\"primaryGoal\":{\"type\":\"string\",\"enum\":[\"COMMUNICATION\",\"EXAM_PREP\",\"BUSINESS\"]},\"dailyTargetMinutes\":{\"maximum\":120,\"minimum\":5,\"type\":\"integer\",\"format\":\"int32\"},\"preferredTopics\":{\"uniqueItems\":true,\"type\":\"array\",\"items\":{\"type\":\"string\"}}}},\"ApiResponseLearningProfileResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/LearningProfileResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"LearningProfileResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"userId\":{\"type\":\"integer\",\"format\":\"int64\"},\"grammarLevel\":{\"type\":\"string\",\"enum\":[\"A1\",\"A2\",\"B1\",\"B2\",\"C1\",\"C2\"]},\"vocabularyLevel\":{\"type\":\"string\",\"enum\":[\"A1\",\"A2\",\"B1\",\"B2\",\"C1\",\"C2\"]},\"readingLevel\":{\"type\":\"string\",\"enum\":[\"A1\",\"A2\",\"B1\",\"B2\",\"C1\",\"C2\"]},\"listeningLevel\":{\"type\":\"string\",\"enum\":[\"A1\",\"A2\",\"B1\",\"B2\",\"C1\",\"C2\"]},\"overallLevel\":{\"type\":\"string\",\"enum\":[\"A1\",\"A2\",\"B1\",\"B2\",\"C1\",\"C2\"]},\"primaryGoal\":{\"type\":\"string\",\"enum\":[\"COMMUNICATION\",\"EXAM_PREP\",\"BUSINESS\"]},\"dailyTargetMinutes\":{\"type\":\"integer\",\"format\":\"int32\"},\"preferredTopics\":{\"uniqueItems\":true,\"type\":\"array\",\"items\":{\"type\":\"string\"}},\"weakSkills\":{\"uniqueItems\":true,\"type\":\"array\",\"items\":{\"type\":\"string\",\"enum\":[\"GRAMMAR\",\"VOCABULARY\",\"READING\",\"LISTENING\"]}},\"onboardingCompleted\":{\"type\":\"boolean\"},\"hasCompletedOnboarding\":{\"type\":\"boolean\"}}},\"ExamRequest\":{\"required\":[\"classId\",\"durationMinutes\",\"endTime\",\"startTime\",\"title\"],\"type\":\"object\",\"properties\":{\"title\":{\"maxLength\":200,\"minLength\":0,\"type\":\"string\"},\"classId\":{\"type\":\"integer\",\"format\":\"int64\"},\"startTime\":{\"type\":\"string\",\"format\":\"date-time\"},\"endTime\":{\"type\":\"string\",\"format\":\"date-time\"},\"durationMinutes\":{\"maximum\":180,\"minimum\":1,\"type\":\"integer\",\"format\":\"int32\"},\"shuffleQuestions\":{\"type\":\"boolean\"},\"shuffleAnswers\":{\"type\":\"boolean\"},\"antiCheatEnabled\":{\"type\":\"boolean\"},\"questionIds\":{\"type\":\"array\",\"items\":{\"type\":\"integer\",\"format\":\"int64\"}}}},\"ApiResponseExamResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/ExamResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ExamResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"title\":{\"type\":\"string\"},\"status\":{\"type\":\"string\"},\"scorePublished\":{\"type\":\"boolean\"},\"schoolId\":{\"type\":\"integer\",\"format\":\"int64\"},\"schoolName\":{\"type\":\"string\"},\"classId\":{\"type\":\"integer\",\"format\":\"int64\"},\"className\":{\"type\":\"string\"},\"teacherId\":{\"type\":\"integer\",\"format\":\"int64\"},\"teacherName\":{\"type\":\"string\"},\"startTime\":{\"type\":\"string\",\"format\":\"date-time\"},\"endTime\":{\"type\":\"string\",\"format\":\"date-time\"},\"durationMinutes\":{\"type\":\"integer\",\"format\":\"int32\"},\"shuffleQuestions\":{\"type\":\"boolean\"},\"shuffleAnswers\":{\"type\":\"boolean\"},\"antiCheatEnabled\":{\"type\":\"boolean\"},\"questionCount\":{\"type\":\"integer\",\"format\":\"int32\"},\"totalPoints\":{\"type\":\"integer\",\"format\":\"int32\"},\"submittedCount\":{\"type\":\"integer\",\"format\":\"int64\"},\"averageScore\":{\"type\":\"number\",\"format\":\"double\"},\"questions\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/QuestionResponse\"}}}},\"ClassRoomRequest\":{\"required\":[\"name\"],\"type\":\"object\",\"properties\":{\"name\":{\"maxLength\":100,\"minLength\":0,\"type\":\"string\"},\"schoolId\":{\"type\":\"integer\",\"format\":\"int64\"},\"teacherId\":{\"type\":\"integer\",\"format\":\"int64\"},\"academicYear\":{\"maxLength\":20,\"minLength\":0,\"type\":\"string\"},\"isActive\":{\"type\":\"boolean\"}}},\"ApiResponseClassRoomResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/ClassRoomResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ClassRoomResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"name\":{\"type\":\"string\"},\"academicYear\":{\"type\":\"string\"},\"isActive\":{\"type\":\"boolean\"},\"schoolId\":{\"type\":\"integer\",\"format\":\"int64\"},\"schoolName\":{\"type\":\"string\"},\"teacherId\":{\"type\":\"integer\",\"format\":\"int64\"},\"teacherName\":{\"type\":\"string\"},\"studentCount\":{\"type\":\"integer\",\"format\":\"int64\"},\"createdAt\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponseMapStringObject\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"object\",\"additionalProperties\":{\"type\":\"object\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"CreateUserRequest\":{\"required\":[\"email\",\"fullName\",\"password\",\"roles\",\"username\"],\"type\":\"object\",\"properties\":{\"username\":{\"maxLength\":50,\"minLength\":3,\"type\":\"string\"},\"email\":{\"type\":\"string\"},\"password\":{\"maxLength\":2147483647,\"minLength\":6,\"type\":\"string\"},\"fullName\":{\"type\":\"string\"},\"roles\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}},\"schoolId\":{\"type\":\"integer\",\"format\":\"int64\"},\"classId\":{\"type\":\"integer\",\"format\":\"int64\"}}},\"ApiResponseString\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"string\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"SrsReviewRequest\":{\"required\":[\"vocabularyId\"],\"type\":\"object\",\"properties\":{\"vocabularyId\":{\"type\":\"integer\",\"format\":\"int64\"},\"quality\":{\"maximum\":5,\"minimum\":0,\"type\":\"integer\",\"format\":\"int32\"}}},\"ApiResponseSrsDueResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/SrsDueResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"SrsDueResponse\":{\"type\":\"object\",\"properties\":{\"vocabularyId\":{\"type\":\"integer\",\"format\":\"int64\"},\"grammarId\":{\"type\":\"integer\",\"format\":\"int64\"},\"contentType\":{\"type\":\"string\"},\"word\":{\"type\":\"string\"},\"pronunciation\":{\"type\":\"string\"},\"meaning\":{\"type\":\"string\"},\"exampleSentence\":{\"type\":\"string\"},\"audioUrl\":{\"type\":\"string\"},\"easinessFactor\":{\"type\":\"number\",\"format\":\"double\"},\"intervalDays\":{\"type\":\"integer\",\"format\":\"int32\"},\"repetitions\":{\"type\":\"integer\",\"format\":\"int32\"},\"nextReviewAt\":{\"type\":\"string\",\"format\":\"date\"},\"lastReviewedAt\":{\"type\":\"string\",\"format\":\"date-time\"},\"overdueDays\":{\"type\":\"integer\",\"format\":\"int32\"},\"totalDue\":{\"type\":\"integer\",\"format\":\"int32\"},\"totalReviewedToday\":{\"type\":\"integer\",\"format\":\"int32\"},\"items\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/SrsDueResponse\"}}}},\"DailyQuestRequest\":{\"type\":\"object\",\"properties\":{\"tasks\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/DailyQuestTaskRequest\"}}}},\"DailyQuestTaskRequest\":{\"type\":\"object\",\"properties\":{\"taskType\":{\"type\":\"string\"},\"targetCount\":{\"type\":\"integer\",\"format\":\"int32\"}}},\"ApiResponseDailyQuestResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/DailyQuestResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"DailyQuestResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"questDate\":{\"type\":\"string\",\"format\":\"date\"},\"isCompleted\":{\"type\":\"boolean\"},\"tasks\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/DailyQuestTaskResponse\"}},\"totalCoins\":{\"type\":\"integer\",\"format\":\"int32\"}}},\"DailyQuestTaskResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"taskType\":{\"type\":\"string\"},\"targetCount\":{\"type\":\"integer\",\"format\":\"int32\"},\"currentProgress\":{\"type\":\"integer\",\"format\":\"int32\"},\"isCompleted\":{\"type\":\"boolean\"},\"coins\":{\"type\":\"integer\",\"format\":\"int32\"}}},\"ApiResponseProgressResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/ProgressResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ProgressResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"userId\":{\"type\":\"integer\",\"format\":\"int64\"},\"userName\":{\"type\":\"string\"},\"lessonId\":{\"type\":\"integer\",\"format\":\"int64\"},\"lessonTitle\":{\"type\":\"string\"},\"completionPercentage\":{\"type\":\"integer\",\"format\":\"int32\"},\"isCompleted\":{\"type\":\"boolean\"},\"lastAccessed\":{\"type\":\"string\",\"format\":\"date-time\"},\"questTaskCompleted\":{\"type\":\"boolean\"}}},\"ApiResponsePlacementSessionResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/PlacementSessionResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"PlacementSessionResponse\":{\"type\":\"object\",\"properties\":{\"sessionId\":{\"type\":\"string\"}}},\"PlacementAnswerRequest\":{\"required\":[\"questionId\",\"selectedAnswer\"],\"type\":\"object\",\"properties\":{\"questionId\":{\"type\":\"integer\",\"format\":\"int64\"},\"selectedAnswer\":{\"type\":\"string\"},\"timeSpentSeconds\":{\"maximum\":3600,\"minimum\":0,\"type\":\"integer\",\"format\":\"int32\"}}},\"ApiResponsePlacementAnswerAccepted\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/PlacementAnswerAccepted\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"PlacementAnswerAccepted\":{\"type\":\"object\",\"properties\":{\"nextQuestionAvailable\":{\"type\":\"boolean\"},\"result\":{\"$ref\":\"#/components/schemas/PlacementResultResponse\"}}},\"PlacementResultResponse\":{\"type\":\"object\",\"properties\":{\"sessionId\":{\"type\":\"string\"},\"completed\":{\"type\":\"boolean\"},\"skillLevels\":{\"type\":\"object\",\"additionalProperties\":{\"type\":\"string\",\"enum\":[\"A1\",\"A2\",\"B1\",\"B2\",\"C1\",\"C2\"]}},\"grammarLevel\":{\"type\":\"string\",\"enum\":[\"A1\",\"A2\",\"B1\",\"B2\",\"C1\",\"C2\"]},\"vocabularyLevel\":{\"type\":\"string\",\"enum\":[\"A1\",\"A2\",\"B1\",\"B2\",\"C1\",\"C2\"]},\"readingLevel\":{\"type\":\"string\",\"enum\":[\"A1\",\"A2\",\"B1\",\"B2\",\"C1\",\"C2\"]},\"listeningLevel\":{\"type\":\"string\",\"enum\":[\"A1\",\"A2\",\"B1\",\"B2\",\"C1\",\"C2\"]},\"overallLevel\":{\"type\":\"string\",\"enum\":[\"A1\",\"A2\",\"B1\",\"B2\",\"C1\",\"C2\"]},\"effectiveStartLevel\":{\"type\":\"string\",\"enum\":[\"A1\",\"A2\",\"B1\",\"B2\",\"C1\",\"C2\"]},\"correctCounts\":{\"type\":\"object\",\"additionalProperties\":{\"type\":\"integer\",\"format\":\"int32\"}},\"totalCounts\":{\"type\":\"object\",\"additionalProperties\":{\"type\":\"integer\",\"format\":\"int32\"}}}},\"BroadcastNotificationRequest\":{\"type\":\"object\",\"properties\":{\"title\":{\"type\":\"string\"},\"message\":{\"type\":\"string\"},\"imageUrl\":{\"type\":\"string\"},\"scope\":{\"type\":\"string\"},\"targetRole\":{\"type\":\"string\"},\"schoolId\":{\"type\":\"integer\",\"format\":\"int64\"},\"classId\":{\"type\":\"integer\",\"format\":\"int64\"}}},\"MistakeNotebookRequest\":{\"required\":[\"vocabularyId\"],\"type\":\"object\",\"properties\":{\"userId\":{\"type\":\"integer\",\"format\":\"int64\"},\"vocabularyId\":{\"type\":\"integer\",\"format\":\"int64\"},\"userRecordingUrl\":{\"type\":\"string\"}}},\"ApiResponseMistakeNotebookDTO\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/MistakeNotebookDTO\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"MistakeNotebookDTO\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"userId\":{\"type\":\"integer\",\"format\":\"int64\"},\"vocabularyId\":{\"type\":\"integer\",\"format\":\"int64\"},\"word\":{\"type\":\"string\"},\"meaning\":{\"type\":\"string\"},\"pronunciation\":{\"type\":\"string\"},\"audioUrl\":{\"type\":\"string\"},\"mistakeCount\":{\"type\":\"integer\",\"format\":\"int32\"},\"userRecordingUrl\":{\"type\":\"string\"},\"addedAt\":{\"type\":\"string\",\"format\":\"date-time\"},\"lastMistakeAt\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"WritingFeedbackRequest\":{\"required\":[\"contentId\",\"contentType\",\"userText\"],\"type\":\"object\",\"properties\":{\"contentType\":{\"type\":\"string\"},\"contentId\":{\"type\":\"integer\",\"format\":\"int64\"},\"userText\":{\"type\":\"string\"}}},\"CompleteOnboardingRequest\":{\"required\":[\"primaryGoal\"],\"type\":\"object\",\"properties\":{\"primaryGoal\":{\"type\":\"string\",\"enum\":[\"COMMUNICATION\",\"EXAM_PREP\",\"BUSINESS\"]},\"dailyTargetMinutes\":{\"maximum\":300,\"minimum\":1,\"type\":\"integer\",\"format\":\"int32\"},\"preferredTopics\":{\"uniqueItems\":true,\"type\":\"array\",\"items\":{\"type\":\"string\"}}}},\"AnswerDTO\":{\"type\":\"object\",\"properties\":{\"questionId\":{\"type\":\"integer\",\"format\":\"int64\"},\"selectedOptionId\":{\"type\":\"integer\",\"format\":\"int64\"},\"selectedOptionIds\":{\"type\":\"array\",\"items\":{\"type\":\"integer\",\"format\":\"int64\"}},\"textAnswer\":{\"type\":\"string\"}}},\"ExamSubmitDTO\":{\"required\":[\"examResultId\"],\"type\":\"object\",\"properties\":{\"examResultId\":{\"type\":\"integer\",\"format\":\"int64\"},\"answers\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/AnswerDTO\"}}}},\"ApiResponseExamResultDTO\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/ExamResultDTO\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ExamResultDTO\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"examId\":{\"type\":\"integer\",\"format\":\"int64\"},\"examTitle\":{\"type\":\"string\"},\"studentId\":{\"type\":\"integer\",\"format\":\"int64\"},\"studentName\":{\"type\":\"string\"},\"score\":{\"type\":\"number\"},\"correctCount\":{\"type\":\"integer\",\"format\":\"int32\"},\"totalQuestions\":{\"type\":\"integer\",\"format\":\"int32\"},\"percentage\":{\"type\":\"number\",\"format\":\"double\"},\"grade\":{\"type\":\"string\"},\"submittedAt\":{\"type\":\"string\",\"format\":\"date-time\"},\"violationCount\":{\"type\":\"integer\",\"format\":\"int32\"},\"status\":{\"type\":\"string\"}}},\"ApiResponseExamTakeDTO\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/ExamTakeDTO\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ExamQuestionDTO\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"questionText\":{\"type\":\"string\"},\"questionType\":{\"type\":\"string\"},\"points\":{\"type\":\"integer\",\"format\":\"int32\"},\"options\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/QuestionOptionDTO\"}}}},\"ExamTakeDTO\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"title\":{\"type\":\"string\"},\"durationMinutes\":{\"type\":\"integer\",\"format\":\"int32\"},\"startTime\":{\"type\":\"string\",\"format\":\"date-time\"},\"endTime\":{\"type\":\"string\",\"format\":\"date-time\"},\"antiCheatEnabled\":{\"type\":\"boolean\"},\"examResultId\":{\"type\":\"integer\",\"format\":\"int64\"},\"questions\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/ExamQuestionDTO\"}},\"totalQuestions\":{\"type\":\"integer\",\"format\":\"int32\"}}},\"QuestionOptionDTO\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"optionText\":{\"type\":\"string\"}}},\"AntiCheatEventDTO\":{\"required\":[\"eventType\",\"examResultId\"],\"type\":\"object\",\"properties\":{\"examResultId\":{\"type\":\"integer\",\"format\":\"int64\"},\"eventType\":{\"type\":\"string\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"},\"details\":{\"type\":\"string\"}}},\"AnswerSubmission\":{\"required\":[\"questionId\"],\"type\":\"object\",\"properties\":{\"questionId\":{\"type\":\"integer\",\"format\":\"int64\"},\"selectedOptionId\":{\"type\":\"integer\",\"format\":\"int64\"},\"answerText\":{\"type\":\"string\"}}},\"SubmitExamRequest\":{\"required\":[\"answers\",\"examId\"],\"type\":\"object\",\"properties\":{\"examId\":{\"type\":\"integer\",\"format\":\"int64\"},\"answers\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/AnswerSubmission\"}}}},\"ApiResponseExamResultResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/ExamResultResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ExamResultResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"examId\":{\"type\":\"integer\",\"format\":\"int64\"},\"examTitle\":{\"type\":\"string\"},\"studentId\":{\"type\":\"integer\",\"format\":\"int64\"},\"studentName\":{\"type\":\"string\"},\"score\":{\"type\":\"number\"},\"correctCount\":{\"type\":\"integer\",\"format\":\"int32\"},\"totalQuestions\":{\"type\":\"integer\",\"format\":\"int32\"},\"percentage\":{\"type\":\"number\",\"format\":\"double\"},\"submittedAt\":{\"type\":\"string\",\"format\":\"date-time\"},\"violationCount\":{\"type\":\"integer\",\"format\":\"int32\"},\"grade\":{\"type\":\"string\"}}},\"BatchEventRequest\":{\"required\":[\"events\"],\"type\":\"object\",\"properties\":{\"events\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/EventItem\"}}}},\"EventItem\":{\"required\":[\"eventType\"],\"type\":\"object\",\"properties\":{\"eventType\":{\"pattern\":\"^[A-Z_]{1,50}$\",\"type\":\"string\"},\"contentType\":{\"type\":\"string\"},\"contentId\":{\"type\":\"integer\",\"format\":\"int64\"},\"skill\":{\"type\":\"string\",\"enum\":[\"GRAMMAR\",\"VOCABULARY\",\"READING\",\"LISTENING\"]},\"cefrLevel\":{\"type\":\"string\"},\"isCorrect\":{\"type\":\"boolean\"},\"timeSpentSeconds\":{\"type\":\"integer\",\"format\":\"int32\"},\"sessionId\":{\"type\":\"string\"},\"metadata\":{\"maxLength\":2000,\"minLength\":0,\"type\":\"string\"}}},\"BadgeRequest\":{\"type\":\"object\",\"properties\":{\"name\":{\"type\":\"string\"},\"description\":{\"type\":\"string\"},\"iconUrl\":{\"type\":\"string\"}}},\"ApiResponseBadgeResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/BadgeResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"BadgeResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"name\":{\"type\":\"string\"},\"description\":{\"type\":\"string\"},\"iconUrl\":{\"type\":\"string\"},\"earnedAt\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponseListBadgeResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/BadgeResponse\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponseCheckBadgeResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/CheckBadgeResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"BadgeDTO\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"badgeKey\":{\"type\":\"string\"},\"name\":{\"type\":\"string\"},\"description\":{\"type\":\"string\"},\"iconEmoji\":{\"type\":\"string\"},\"groupName\":{\"type\":\"string\",\"enum\":[\"STREAK\",\"LESSON\",\"QUIZ\",\"LEVEL\",\"SPECIAL\",\"SOCIAL\"]},\"difficulty\":{\"type\":\"string\",\"enum\":[\"EASY\",\"MEDIUM\",\"HARD\",\"LEGENDARY\"]},\"isSecret\":{\"type\":\"boolean\"},\"earnedAt\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"CheckBadgeResponse\":{\"type\":\"object\",\"properties\":{\"newlyEarnedBadges\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/BadgeDTO\"}},\"totalBadgesEarned\":{\"type\":\"integer\",\"format\":\"int32\"},\"message\":{\"type\":\"string\"}}},\"ResetPasswordRequest\":{\"required\":[\"confirmPassword\",\"newPassword\",\"otp\"],\"type\":\"object\",\"properties\":{\"otp\":{\"maxLength\":6,\"minLength\":6,\"type\":\"string\"},\"newPassword\":{\"maxLength\":2147483647,\"minLength\":6,\"type\":\"string\"},\"confirmPassword\":{\"type\":\"string\"}}},\"RegisterRequest\":{\"required\":[\"email\",\"fullName\",\"password\",\"username\"],\"type\":\"object\",\"properties\":{\"username\":{\"maxLength\":50,\"minLength\":3,\"type\":\"string\"},\"email\":{\"type\":\"string\"},\"password\":{\"maxLength\":2147483647,\"minLength\":6,\"type\":\"string\"},\"fullName\":{\"type\":\"string\"},\"role\":{\"type\":\"string\"}}},\"ApiResponseAuthResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/AuthResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"AuthResponse\":{\"type\":\"object\",\"properties\":{\"accessToken\":{\"type\":\"string\"},\"refreshToken\":{\"type\":\"string\"},\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"username\":{\"type\":\"string\"},\"email\":{\"type\":\"string\"},\"roles\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}}}},\"LoginRequest\":{\"required\":[\"password\",\"username\"],\"type\":\"object\",\"properties\":{\"username\":{\"type\":\"string\"},\"password\":{\"type\":\"string\"}}},\"GoogleLoginRequest\":{\"required\":[\"accessToken\"],\"type\":\"object\",\"properties\":{\"accessToken\":{\"type\":\"string\"}}},\"ForgotPasswordRequest\":{\"required\":[\"email\"],\"type\":\"object\",\"properties\":{\"email\":{\"type\":\"string\"}}},\"ChangePasswordRequest\":{\"required\":[\"confirmPassword\",\"newPassword\",\"oldPassword\"],\"type\":\"object\",\"properties\":{\"oldPassword\":{\"type\":\"string\"},\"newPassword\":{\"maxLength\":2147483647,\"minLength\":6,\"type\":\"string\"},\"confirmPassword\":{\"type\":\"string\"}}},\"ApiResponseListVocabularyResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/VocabularyResponse\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"Pageable\":{\"type\":\"object\",\"properties\":{\"page\":{\"minimum\":0,\"type\":\"integer\",\"format\":\"int32\"},\"size\":{\"minimum\":1,\"type\":\"integer\",\"format\":\"int32\"},\"sort\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}}}},\"ApiResponsePageVocabularyResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/PageVocabularyResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"PageVocabularyResponse\":{\"type\":\"object\",\"properties\":{\"totalElements\":{\"type\":\"integer\",\"format\":\"int64\"},\"totalPages\":{\"type\":\"integer\",\"format\":\"int32\"},\"pageable\":{\"$ref\":\"#/components/schemas/PageableObject\"},\"size\":{\"type\":\"integer\",\"format\":\"int32\"},\"content\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/VocabularyResponse\"}},\"number\":{\"type\":\"integer\",\"format\":\"int32\"},\"sort\":{\"$ref\":\"#/components/schemas/SortObject\"},\"numberOfElements\":{\"type\":\"integer\",\"format\":\"int32\"},\"first\":{\"type\":\"boolean\"},\"last\":{\"type\":\"boolean\"},\"empty\":{\"type\":\"boolean\"}}},\"PageableObject\":{\"type\":\"object\",\"properties\":{\"pageNumber\":{\"type\":\"integer\",\"format\":\"int32\"},\"pageSize\":{\"type\":\"integer\",\"format\":\"int32\"},\"paged\":{\"type\":\"boolean\"},\"unpaged\":{\"type\":\"boolean\"},\"offset\":{\"type\":\"integer\",\"format\":\"int64\"},\"sort\":{\"$ref\":\"#/components/schemas/SortObject\"}}},\"SortObject\":{\"type\":\"object\",\"properties\":{\"sorted\":{\"type\":\"boolean\"},\"unsorted\":{\"type\":\"boolean\"},\"empty\":{\"type\":\"boolean\"}}},\"ApiResponseLong\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"integer\",\"format\":\"int64\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponsePageUserResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/PageUserResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"PageUserResponse\":{\"type\":\"object\",\"properties\":{\"totalElements\":{\"type\":\"integer\",\"format\":\"int64\"},\"totalPages\":{\"type\":\"integer\",\"format\":\"int32\"},\"pageable\":{\"$ref\":\"#/components/schemas/PageableObject\"},\"size\":{\"type\":\"integer\",\"format\":\"int32\"},\"content\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/UserResponse\"}},\"number\":{\"type\":\"integer\",\"format\":\"int32\"},\"sort\":{\"$ref\":\"#/components/schemas/SortObject\"},\"numberOfElements\":{\"type\":\"integer\",\"format\":\"int32\"},\"first\":{\"type\":\"boolean\"},\"last\":{\"type\":\"boolean\"},\"empty\":{\"type\":\"boolean\"}}},\"AdminUserStatsResponse\":{\"type\":\"object\",\"properties\":{\"totalUsers\":{\"type\":\"integer\",\"format\":\"int64\"},\"activeUsers\":{\"type\":\"integer\",\"format\":\"int64\"},\"teacherCount\":{\"type\":\"integer\",\"format\":\"int64\"},\"studentCount\":{\"type\":\"integer\",\"format\":\"int64\"},\"totalCoins\":{\"type\":\"integer\",\"format\":\"int64\"}}},\"ApiResponseAdminUserStatsResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/AdminUserStatsResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponseListAuditLogResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/AuditLogResponse\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"AuditLogResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"action\":{\"type\":\"string\"},\"details\":{\"type\":\"string\"},\"ipAddress\":{\"type\":\"string\"},\"userAgent\":{\"type\":\"string\"},\"createdAt\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponseListMapStringObject\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"type\":\"object\",\"additionalProperties\":{\"type\":\"object\"}}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponseListLessonResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/LessonResponse\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponseListSchoolResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/SchoolResponse\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponsePageSchoolResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/PageSchoolResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"PageSchoolResponse\":{\"type\":\"object\",\"properties\":{\"totalElements\":{\"type\":\"integer\",\"format\":\"int64\"},\"totalPages\":{\"type\":\"integer\",\"format\":\"int32\"},\"pageable\":{\"$ref\":\"#/components/schemas/PageableObject\"},\"size\":{\"type\":\"integer\",\"format\":\"int32\"},\"content\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/SchoolResponse\"}},\"number\":{\"type\":\"integer\",\"format\":\"int32\"},\"sort\":{\"$ref\":\"#/components/schemas/SortObject\"},\"numberOfElements\":{\"type\":\"integer\",\"format\":\"int32\"},\"first\":{\"type\":\"boolean\"},\"last\":{\"type\":\"boolean\"},\"empty\":{\"type\":\"boolean\"}}},\"ApiResponseRecommendationResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/RecommendationResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"RecommendationResponse\":{\"type\":\"object\",\"properties\":{\"total\":{\"type\":\"integer\",\"format\":\"int32\"},\"lessons\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/RecommendedLesson\"}},\"reasons\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}}}},\"RecommendedLesson\":{\"type\":\"object\",\"properties\":{\"lessonId\":{\"type\":\"integer\",\"format\":\"int64\"},\"title\":{\"type\":\"string\"},\"difficultyLevel\":{\"type\":\"integer\",\"format\":\"int32\"},\"topicName\":{\"type\":\"string\"},\"completionPercentage\":{\"type\":\"integer\",\"format\":\"int32\"},\"isCompleted\":{\"type\":\"boolean\"},\"cefrLevel\":{\"type\":\"string\"},\"tags\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}},\"reason\":{\"type\":\"string\"},\"relevanceScore\":{\"type\":\"number\",\"format\":\"double\"}}},\"ApiResponseListDailyQuestResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/DailyQuestResponse\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponseListQuestionResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/QuestionResponse\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponsePageQuestionResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/PageQuestionResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"PageQuestionResponse\":{\"type\":\"object\",\"properties\":{\"totalElements\":{\"type\":\"integer\",\"format\":\"int64\"},\"totalPages\":{\"type\":\"integer\",\"format\":\"int32\"},\"pageable\":{\"$ref\":\"#/components/schemas/PageableObject\"},\"size\":{\"type\":\"integer\",\"format\":\"int32\"},\"content\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/QuestionResponse\"}},\"number\":{\"type\":\"integer\",\"format\":\"int32\"},\"sort\":{\"$ref\":\"#/components/schemas/SortObject\"},\"numberOfElements\":{\"type\":\"integer\",\"format\":\"int32\"},\"first\":{\"type\":\"boolean\"},\"last\":{\"type\":\"boolean\"},\"empty\":{\"type\":\"boolean\"}}},\"ApiResponseMapStringLong\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"object\",\"additionalProperties\":{\"type\":\"integer\",\"format\":\"int64\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponseListProgressResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/ProgressResponse\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponsePlacementResultResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/PlacementResultResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponsePlacementQuestionResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/PlacementQuestionResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"PlacementQuestionResponse\":{\"type\":\"object\",\"properties\":{\"questionId\":{\"type\":\"integer\",\"format\":\"int64\"},\"skill\":{\"type\":\"string\",\"enum\":[\"GRAMMAR\",\"VOCABULARY\",\"READING\",\"LISTENING\"]},\"questionText\":{\"type\":\"string\"},\"options\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}},\"questionIndex\":{\"type\":\"integer\",\"format\":\"int32\"},\"totalQuestions\":{\"type\":\"integer\",\"format\":\"int32\"},\"sessionId\":{\"type\":\"string\"}}},\"ApiResponseListNotificationResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/NotificationResponse\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"NotificationResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"title\":{\"type\":\"string\"},\"message\":{\"type\":\"string\"},\"imageUrl\":{\"type\":\"string\"},\"isRead\":{\"type\":\"boolean\"},\"createdAt\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponseListMistakeNotebookDTO\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/MistakeNotebookDTO\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponsePageLessonResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/PageLessonResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"PageLessonResponse\":{\"type\":\"object\",\"properties\":{\"totalElements\":{\"type\":\"integer\",\"format\":\"int64\"},\"totalPages\":{\"type\":\"integer\",\"format\":\"int32\"},\"pageable\":{\"$ref\":\"#/components/schemas/PageableObject\"},\"size\":{\"type\":\"integer\",\"format\":\"int32\"},\"content\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/LessonResponse\"}},\"number\":{\"type\":\"integer\",\"format\":\"int32\"},\"sort\":{\"$ref\":\"#/components/schemas/SortObject\"},\"numberOfElements\":{\"type\":\"integer\",\"format\":\"int32\"},\"first\":{\"type\":\"boolean\"},\"last\":{\"type\":\"boolean\"},\"empty\":{\"type\":\"boolean\"}}},\"ApiResponseLearningProfileStatusResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/LearningProfileStatusResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"LearningProfileStatusResponse\":{\"type\":\"object\",\"properties\":{\"onboardingCompleted\":{\"type\":\"boolean\"}}},\"ApiResponseLearningPathResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/LearningPathResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"LearningPathResponse\":{\"type\":\"object\",\"properties\":{\"pathId\":{\"type\":\"integer\",\"format\":\"int64\"},\"name\":{\"type\":\"string\"},\"description\":{\"type\":\"string\"},\"targetCefr\":{\"type\":\"string\"},\"targetGoal\":{\"type\":\"string\"},\"estimatedDays\":{\"type\":\"integer\",\"format\":\"int32\"},\"nodes\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/PathNodeResponse\"}}}},\"PathNodeResponse\":{\"type\":\"object\",\"properties\":{\"nodeId\":{\"type\":\"integer\",\"format\":\"int64\"},\"lessonId\":{\"type\":\"integer\",\"format\":\"int64\"},\"lessonTitle\":{\"type\":\"string\"},\"skill\":{\"type\":\"string\"},\"cefrLevel\":{\"type\":\"string\"},\"orderIndex\":{\"type\":\"integer\",\"format\":\"int32\"},\"estimatedMinutes\":{\"type\":\"integer\",\"format\":\"int32\"},\"isRequired\":{\"type\":\"boolean\"},\"prerequisiteNodeIds\":{\"type\":\"array\",\"items\":{\"type\":\"integer\",\"format\":\"int64\"}},\"isCompleted\":{\"type\":\"boolean\"},\"completionPercentage\":{\"type\":\"integer\",\"format\":\"int32\"}}},\"ApiResponseLeaderboardResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/LeaderboardResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"LeaderboardResponse\":{\"type\":\"object\",\"properties\":{\"rank\":{\"type\":\"integer\",\"format\":\"int32\"},\"userId\":{\"type\":\"integer\",\"format\":\"int64\"},\"username\":{\"type\":\"string\"},\"fullName\":{\"type\":\"string\"},\"avatarUrl\":{\"type\":\"string\"},\"totalCoins\":{\"type\":\"integer\",\"format\":\"int32\"},\"streakDays\":{\"type\":\"integer\",\"format\":\"int32\"},\"averageScore\":{\"type\":\"number\",\"format\":\"double\"}}},\"ApiResponseListLeaderboardResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/LeaderboardResponse\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponsePageLeaderboardResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/PageLeaderboardResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"PageLeaderboardResponse\":{\"type\":\"object\",\"properties\":{\"totalElements\":{\"type\":\"integer\",\"format\":\"int64\"},\"totalPages\":{\"type\":\"integer\",\"format\":\"int32\"},\"pageable\":{\"$ref\":\"#/components/schemas/PageableObject\"},\"size\":{\"type\":\"integer\",\"format\":\"int32\"},\"content\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/LeaderboardResponse\"}},\"number\":{\"type\":\"integer\",\"format\":\"int32\"},\"sort\":{\"$ref\":\"#/components/schemas/SortObject\"},\"numberOfElements\":{\"type\":\"integer\",\"format\":\"int32\"},\"first\":{\"type\":\"boolean\"},\"last\":{\"type\":\"boolean\"},\"empty\":{\"type\":\"boolean\"}}},\"ApiResponsePageExamResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/PageExamResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"PageExamResponse\":{\"type\":\"object\",\"properties\":{\"totalElements\":{\"type\":\"integer\",\"format\":\"int64\"},\"totalPages\":{\"type\":\"integer\",\"format\":\"int32\"},\"pageable\":{\"$ref\":\"#/components/schemas/PageableObject\"},\"size\":{\"type\":\"integer\",\"format\":\"int32\"},\"content\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/ExamResponse\"}},\"number\":{\"type\":\"integer\",\"format\":\"int32\"},\"sort\":{\"$ref\":\"#/components/schemas/SortObject\"},\"numberOfElements\":{\"type\":\"integer\",\"format\":\"int32\"},\"first\":{\"type\":\"boolean\"},\"last\":{\"type\":\"boolean\"},\"empty\":{\"type\":\"boolean\"}}},\"ApiResponseListExamResultResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/ExamResultResponse\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"AntiCheatEvent\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"eventType\":{\"type\":\"string\"},\"eventTime\":{\"type\":\"string\",\"format\":\"date-time\"},\"details\":{\"type\":\"string\"}}},\"ApiResponseListAntiCheatEvent\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/AntiCheatEvent\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponseListExamResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/ExamResponse\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponseDashboardStatsResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/DashboardStatsResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"DashboardStatsResponse\":{\"type\":\"object\",\"properties\":{\"totalUsers\":{\"type\":\"integer\",\"format\":\"int64\"},\"activeUsers\":{\"type\":\"integer\",\"format\":\"int64\"},\"teacherCount\":{\"type\":\"integer\",\"format\":\"int64\"},\"studentCount\":{\"type\":\"integer\",\"format\":\"int64\"},\"totalSchools\":{\"type\":\"integer\",\"format\":\"int64\"},\"activeSchools\":{\"type\":\"integer\",\"format\":\"int64\"},\"totalExams\":{\"type\":\"integer\",\"format\":\"int64\"},\"totalQuestions\":{\"type\":\"integer\",\"format\":\"int64\"},\"totalClasses\":{\"type\":\"integer\",\"format\":\"int64\"},\"totalAttempts\":{\"type\":\"integer\",\"format\":\"int64\"},\"averageScore\":{\"type\":\"number\",\"format\":\"double\"}}},\"ApiResponseListClassRoomResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/ClassRoomResponse\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponseListClassStudentResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/ClassStudentResponse\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ClassStudentResponse\":{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\",\"format\":\"int64\"},\"username\":{\"type\":\"string\"},\"fullName\":{\"type\":\"string\"},\"email\":{\"type\":\"string\"},\"avatarUrl\":{\"type\":\"string\"},\"status\":{\"type\":\"string\"},\"joinedAt\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponsePageClassRoomResponse\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"$ref\":\"#/components/schemas/PageClassRoomResponse\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"PageClassRoomResponse\":{\"type\":\"object\",\"properties\":{\"totalElements\":{\"type\":\"integer\",\"format\":\"int64\"},\"totalPages\":{\"type\":\"integer\",\"format\":\"int32\"},\"pageable\":{\"$ref\":\"#/components/schemas/PageableObject\"},\"size\":{\"type\":\"integer\",\"format\":\"int32\"},\"content\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/ClassRoomResponse\"}},\"number\":{\"type\":\"integer\",\"format\":\"int32\"},\"sort\":{\"$ref\":\"#/components/schemas/SortObject\"},\"numberOfElements\":{\"type\":\"integer\",\"format\":\"int32\"},\"first\":{\"type\":\"boolean\"},\"last\":{\"type\":\"boolean\"},\"empty\":{\"type\":\"boolean\"}}},\"ApiResponseListBadgeProgressDTO\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/BadgeProgressDTO\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"BadgeProgressDTO\":{\"type\":\"object\",\"properties\":{\"badgeKey\":{\"type\":\"string\"},\"badgeName\":{\"type\":\"string\"},\"iconEmoji\":{\"type\":\"string\"},\"currentValue\":{\"type\":\"integer\",\"format\":\"int32\"},\"requiredValue\":{\"type\":\"integer\",\"format\":\"int32\"},\"percentComplete\":{\"type\":\"number\",\"format\":\"double\"},\"description\":{\"type\":\"string\"}}},\"ApiResponseListBadgeDTO\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"array\",\"items\":{\"$ref\":\"#/components/schemas/BadgeDTO\"}},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}},\"ApiResponseInteger\":{\"type\":\"object\",\"properties\":{\"success\":{\"type\":\"boolean\"},\"message\":{\"type\":\"string\"},\"data\":{\"type\":\"integer\",\"format\":\"int32\"},\"timestamp\":{\"type\":\"string\",\"format\":\"date-time\"}}}},\"securitySchemes\":{\"Bearer [JWT_REDACTED]\":{\"type\":\"http\",\"description\":\"Nhập JWT token để xác thực\",\"scheme\":\"bearer\",\"bearerFormat\":\"JWT\"}}}}"
  },
  "swagger": {
    "name": "swagger_ui_public",
    "method": "GET",
    "path": "/swagger-ui/index.html",
    "status": 200,
    "ok": true,
    "ms": 22,
    "responseSnippet": "<!-- HTML for static distribution bundle build -->\n<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\">\n    <title>Swagger UI</title>\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"./swagger-ui.css\" />\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"index.css\" />\n    <link rel=\"icon\" type=\"image/png\" href=\"./favicon-32x32.png\" sizes=\"32x32\" />\n    <link rel=\"icon\" type=\"image/png\" href=\"./favicon-16x16.png\" sizes=\"16x16\" />\n  </head>\n\n  <body>\n    <div id=\"swagger-ui\"></div>\n    <script src=\"./swagger-ui-bundle.js\" charset=\"UTF-8\"> </script>\n    <script src=\"./swagger-ui-standalone-preset.js\" charset=\"UTF-8\"> </script>\n    <script src=\"./swagger-initializer.js\" charset=\"UTF-8\"> </script>\n  </body>\n</html>\n",
    "error": null,
    "json": null,
    "text": "<!-- HTML for static distribution bundle build -->\n<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\">\n    <title>Swagger UI</title>\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"./swagger-ui.css\" />\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"index.css\" />\n    <link rel=\"icon\" type=\"image/png\" href=\"./favicon-32x32.png\" sizes=\"32x32\" />\n    <link rel=\"icon\" type=\"image/png\" href=\"./favicon-16x16.png\" sizes=\"16x16\" />\n  </head>\n\n  <body>\n    <div id=\"swagger-ui\"></div>\n    <script src=\"./swagger-ui-bundle.js\" charset=\"UTF-8\"> </script>\n    <script src=\"./swagger-ui-standalone-preset.js\" charset=\"UTF-8\"> </script>\n    <script src=\"./swagger-initializer.js\" charset=\"UTF-8\"> </script>\n  </body>\n</html>\n"
  }
}
```

## Screenshots
Placeholder: add browser/API screenshots when reproducing manually.

## Recommended Fix
Gate Swagger/OpenAPI behind a dev profile, admin auth, IP allowlist, or remove it from production builds.

## Regression Risk
Low if profile-gated; update QA docs to use an authenticated docs route.
