package com.unicore360.unicore360_backend.controller;

import com.unicore360.unicore360_backend.model.Role;
import com.unicore360.unicore360_backend.model.User;
import com.unicore360.unicore360_backend.repository.UserRepository;
import com.unicore360.unicore360_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;
    private final UserService userService;  // inject UserService

    // GET /admin/users - list all users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // PUT /admin/users/{email}/role - update user role
    @PutMapping("/users/{email}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable String email, @RequestBody RoleUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        user.setRole(request.getRole());
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    // GET /admin/technicians - list all users with role TECHNICIAN
    @GetMapping("/technicians")
    public ResponseEntity<List<UserDTO>> getAllTechnicians() {
        List<User> technicians = userService.getUsersByRole(Role.TECHNICIAN);
        List<UserDTO> dtos = technicians.stream()
                .map(u -> new UserDTO(u.getId(), u.getEmail(), u.getName(), u.getRole().name()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Helper DTO for role update request
    static class RoleUpdateRequest {
        private Role role;
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
    }

    // Helper DTO for technician list response
    static class UserDTO {
        private Long id;
        private String email;
        private String name;
        private String role;

        public UserDTO(Long id, String email, String name, String role) {
            this.id = id;
            this.email = email;
            this.name = name;
            this.role = role;
        }

        // Getters (required for JSON serialization)
        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public String getRole() { return role; }
    }
}