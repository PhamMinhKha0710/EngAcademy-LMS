package com.englishlearn.application.dto.response;

public class DashboardStatsResponse {
    // User stats
    private long totalUsers;
    private long activeUsers;
    private long teacherCount;
    private long studentCount;

    // School stats
    private long totalSchools;
    private long activeSchools;

    // Content stats
    private long totalExams;
    private long totalQuestions;
    private long totalClasses;

    // Performance stats
    private long totalAttempts;
    private double averageScore;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long totalUsers, long activeUsers, long teacherCount, long studentCount,
            long totalSchools, long activeSchools, long totalExams, long totalQuestions,
            long totalClasses, long totalAttempts, double averageScore) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.teacherCount = teacherCount;
        this.studentCount = studentCount;
        this.totalSchools = totalSchools;
        this.activeSchools = activeSchools;
        this.totalExams = totalExams;
        this.totalQuestions = totalQuestions;
        this.totalClasses = totalClasses;
        this.totalAttempts = totalAttempts;
        this.averageScore = averageScore;
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

    public long getTotalSchools() {
        return totalSchools;
    }

    public void setTotalSchools(long totalSchools) {
        this.totalSchools = totalSchools;
    }

    public long getActiveSchools() {
        return activeSchools;
    }

    public void setActiveSchools(long activeSchools) {
        this.activeSchools = activeSchools;
    }

    public long getTotalExams() {
        return totalExams;
    }

    public void setTotalExams(long totalExams) {
        this.totalExams = totalExams;
    }

    public long getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(long totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public long getTotalClasses() {
        return totalClasses;
    }

    public void setTotalClasses(long totalClasses) {
        this.totalClasses = totalClasses;
    }

    public long getTotalAttempts() {
        return totalAttempts;
    }

    public void setTotalAttempts(long totalAttempts) {
        this.totalAttempts = totalAttempts;
    }

    public double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(double averageScore) {
        this.averageScore = averageScore;
    }
}
