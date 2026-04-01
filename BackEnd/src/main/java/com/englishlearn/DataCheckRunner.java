package com.englishlearn;

import com.englishlearn.infrastructure.persistence.UserRepository;
import com.englishlearn.infrastructure.persistence.ClassRoomRepository;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.entity.ClassRoom;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class DataCheckRunner implements CommandLineRunner {
    @Autowired private UserRepository userRepository;
    @Autowired private ClassRoomRepository classRoomRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("--- DATA CHECK FOR SCHOOL 1 ---");
        List<User> students = userRepository.findAllStudentsBySchool(1L);
        System.out.println("Students in school 1: " + students.size());
        for (User u : students) {
            System.out.println("Student: " + u.getUsername() + ", schoolId=" + (u.getSchool() != null ? u.getSchool().getId() : "null"));
        }

        List<User> teachers = userRepository.findAllByRolesName("ROLE_TEACHER");
        System.out.println("Teachers in system: " + teachers.size());
        for (User u : teachers) {
            if (u.getSchool() != null && u.getSchool().getId().equals(1L)) {
                System.out.println("Teacher in school 1: " + u.getUsername());
            }
        }

        List<ClassRoom> classes = classRoomRepository.findAll();
        System.out.println("Total classes: " + classes.size());
        for (ClassRoom c : classes) {
            System.out.println("Class: " + c.getName() + ", schoolId=" + (c.getSchool() != null ? c.getSchool().getId() : "null"));
        }
        System.out.println("--- END DATA CHECK ---");
    }
}
