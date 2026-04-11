package com.unicore360.unicore360_backend.service;

import com.unicore360.unicore360_backend.model.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class RoleMappingService {

    @Value("${app.roles.admin-emails:}")
    private List<String> adminEmails;

    @Value("${app.roles.technician-emails:}")
    private List<String> technicianEmails;

    @PostConstruct
    public void init() {
        log.info("Loaded admin emails: {}", adminEmails);
        log.info("Loaded technician emails: {}", technicianEmails);
    }

    public Role getRoleForEmail(String email) {
        if (email == null) return Role.USER;
        String normalized = email.toLowerCase().trim();

        if (adminEmails.stream().anyMatch(admin -> admin.equalsIgnoreCase(normalized))) {
            log.info("Email {} matched ADMIN", normalized);
            return Role.ADMIN;
        }
        if (technicianEmails.stream().anyMatch(tech -> tech.equalsIgnoreCase(normalized))) {
            log.info("Email {} matched TECHNICIAN", normalized);
            return Role.TECHNICIAN;
        }
        log.info("Email {} defaulted to USER", normalized);
        return Role.USER;
    }
}