package com.unicore360.unicore360_backend.security;

import com.unicore360.unicore360_backend.model.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {
    private final OAuth2User oAuth2User;
    private final Role role;
    private final Long userId;  // added

    public CustomOAuth2User(OAuth2User oAuth2User, Role role, Long userId) {
        this.oAuth2User = oAuth2User;
        this.role = role;
        this.userId = userId;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return oAuth2User.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getName() {
        return oAuth2User.getAttribute("name");
    }

    public String getEmail() {
        return oAuth2User.getAttribute("email");
    }

    public Role getRole() {
        return role;
    }

    public Long getUserId() {
        return userId;
    }
}