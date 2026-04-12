package com.unicore360.unicore360_backend.repository;

import com.unicore360.unicore360_backend.model.Role;
import com.unicore360.unicore360_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
}