package com.unicore360.unicore360_backend.service;

import com.unicore360.unicore360_backend.model.Role;
import com.unicore360.unicore360_backend.model.User;
import com.unicore360.unicore360_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // NEW: Get all users by role (e.g., TECHNICIAN)
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }
}