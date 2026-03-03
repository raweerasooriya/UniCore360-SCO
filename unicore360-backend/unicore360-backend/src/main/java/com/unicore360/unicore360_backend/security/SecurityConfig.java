package com.unicore360.unicore360_backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.beans.factory.annotation.Autowired;

import com.unicore360.unicore360_backend.model.User;
import com.unicore360.unicore360_backend.model.Role;
import com.unicore360.unicore360_backend.repository.UserRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserRepository userRepository;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/h2-console/**")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/api/public/**")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/api/test")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/api/hello")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/oauth2/**")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/login/**")).permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(new AuthenticationSuccessHandler() {
                            @Override
                            public void onAuthenticationSuccess(HttpServletRequest request,
                                                                HttpServletResponse response,
                                                                Authentication authentication) throws IOException, ServletException {

                                // Get the OAuth2 token
                                OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
                                OAuth2User oauthUser = oauthToken.getPrincipal();

                                // Get user attributes from Google
                                String email = oauthUser.getAttribute("email");
                                String name = oauthUser.getAttribute("name");
                                String picture = oauthUser.getAttribute("picture");

                                // CHECK IF USER EXISTS IN DATABASE
                                Optional<User> existingUser = userRepository.findByEmail(email);
                                User user;
                                String role;

                                if (existingUser.isPresent()) {
                                    // User exists - get their role
                                    user = existingUser.get();
                                    role = user.getRole().toString();
                                    System.out.println("Existing user logged in: " + email + " with role: " + role);
                                } else {
                                    // NEW USER - Create in database with default USER role
                                    user = new User();
                                    user.setEmail(email);
                                    user.setName(name);
                                    user.setAvatarUrl(picture);
                                    user.setGoogleId(oauthUser.getAttribute("sub"));
                                    user.setRole(Role.USER); // Default role
                                    user.setCreatedAt(LocalDateTime.now());

                                    userRepository.save(user);
                                    role = "USER";
                                    System.out.println("New user created: " + email + " with default USER role");
                                }

                                // Log the user info
                                System.out.println("Google Login Success - Email: " + email + ", Name: " + name + ", Role: " + role);


                                String redirectUrl = "http://localhost:3000/oauth-redirect?email=" + email +
                                        "&name=" + (name != null ? name.replace(" ", "%20") : "") +
                                        "&role=" + role +
                                        "&picture=" + (picture != null ? picture : "");
                                response.sendRedirect(redirectUrl);
                            }
                        })
                )
                .logout(logout -> logout
                        .logoutSuccessUrl("http://localhost:3000/")
                        .permitAll()
                )
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.disable())
                );

        return http.build();
    }
}