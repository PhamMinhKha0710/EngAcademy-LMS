# Gamification – DailyQuest, Badge và Leaderboard

## Mô tả vấn đề

Hệ thống cần gamification để tăng engagement: Daily Quest (nhiệm vụ hàng ngày), Badge (huy hiệu), Leaderboard (bảng xếp hạng).

## Nguyên nhân

- Product: tăng motivation học tập qua game-like elements.
- Yêu cầu: API cho DailyQuest, Badge, Leaderboard.

## Cách debug

N/A – feature development.

## Giải pháp

1. **DailyQuest**: Entity, API tạo/lấy quest, cập nhật tiến độ.
2. **Badge**: Entity, API list badges, gán badge cho user.
3. **Leaderboard**: API lấy top users (theo điểm, streak, v.v.), `GET /leaderboard/top?limit=10`.

Backend đã có controller, service, entity. FrontEnd: trang badges, leaderboard. Admin: quản lý badge, xem leaderboard.

Commits: 83c1a19, 9a567c2, ea25031. Vị trí: `BackEnd/.../GamificationController`, `DailyQuest`, `Badge`, leaderboard API.

## Code mẫu (nếu có)

```java
// Leaderboard
@GetMapping("/leaderboard/top")
public ResponseEntity<ApiResponse<List<LeaderboardEntry>>> getTop(
    @RequestParam(defaultValue = "10") int limit) {
    return ResponseEntity.ok(gamificationService.getTopUsers(limit));
}
```

## Bài học rút ra

- Gamification cần thiết kế rõ: trigger (khi nào unlock badge), quy tắc leaderboard (điểm gì, period nào).
- Cache leaderboard nếu truy vấn nặng.

## Cách phòng tránh sau này

1. Khi thêm badge/quest mới: update entity, migration, API.
2. Leaderboard: cân nhắc caching (Redis) nếu traffic cao.
