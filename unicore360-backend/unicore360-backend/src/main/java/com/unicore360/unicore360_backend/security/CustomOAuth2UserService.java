package com.unicore360.unicore360_backend.security;

import com.unicore360.unicore360_backend.model.Role;
import com.unicore360.unicore360_backend.model.User;
import com.unicore360.unicore360_backend.repository.UserRepository;
import com.unicore360.unicore360_backend.service.RoleMappingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoleMappingService roleMappingService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");
        String avatarUrl = oAuth2User.getAttribute("picture");

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from Google");
        }

        // Determine role from config file
        Role role = roleMappingService.getRoleForEmail(email);
        log.info("User {} with email {} -> role {}", name, email, role);

        // Find existing user or create new
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setGoogleId(googleId);
            user.setCreatedAt(java.time.LocalDateTime.now());
            log.info("Creating new user with email {}", email);
        } else {
            log.info("Updating existing user with email {} (old role {})", email, user.getRole());
        }

        // Always update name, avatar, and role (role from config overrides)
        user.setName(name);
        user.setAvatarUrl(avatarUrl);
        user.setRole(role);   // <-- CRITICAL: Overwrites existing role

        userRepository.save(user);

        return new CustomOAuth2User(oAuth2User, user.getRole());
    }
}