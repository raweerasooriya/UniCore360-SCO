package com.unicore360.unicore360_backend.controller;

import com.unicore360.unicore360_backend.model.Role;
import com.unicore360.unicore360_backend.model.User;
import com.unicore360.unicore360_backend.repository.UserRepository;
import com.unicore360.unicore360_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;
    private final UserService userService;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("User with this email already exists");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setRole(request.getRole());
        user.setCreatedAt(java.time.LocalDateTime.now());
        // GoogleId remains null for manually created users
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    // Inner DTO
    static class CreateUserRequest {
        private String email;
        private String name;
        private Role role;
        // getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
    }

    @PutMapping("/users/{email}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable String email, @RequestBody RoleUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        user.setRole(request.getRole());
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<UserDTO>> getAllTechnicians() {
        List<User> technicians = userService.getUsersByRole(Role.TECHNICIAN);
        List<UserDTO> dtos = technicians.stream()
                .map(u -> new UserDTO(u.getId(), u.getEmail(), u.getName(), u.getRole().name()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId, @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getUserByEmail(userDetails.getUsername());
        if (currentUser.getId().equals(userId)) {
            return ResponseEntity.badRequest().body("You cannot delete your own account");
        }
        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(userToDelete);
        return ResponseEntity.ok().build();
    }

    static class RoleUpdateRequest {
        private Role role;
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
    }

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

        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public String getRole() { return role; }
    }
}