package com.englishlearn.application.dto.response;

public class AdminUserStatsResponse {
    private long totalUsers;
    private long activeUsers;
    private long teacherCount;
    private long studentCount;
    private long totalCoins;

    public AdminUserStatsResponse() {
    }

    public AdminUserStatsResponse(long totalUsers, long activeUsers, long teacherCount, long studentCount,
            long totalCoins) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.teacherCount = teacherCount;
        this.studentCount = studentCount;
        this.totalCoins = totalCoins;
    }

    // Getters and Setters
    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getTeacherCount() {
        return teacherCount;
    }

    public void setTeacherCount(long teacherCount) {
        this.teacherCount = teacherCount;
    }

    public long getStudentCount() {
        return studentCount;
    }

    public void setStudentCount(long studentCount) {
        this.studentCount = studentCount;
    }

    public long getTotalCoins() {
        return totalCoins;
    }

    public void setTotalCoins(long totalCoins) {
        this.totalCoins = totalCoins;
    }
}
