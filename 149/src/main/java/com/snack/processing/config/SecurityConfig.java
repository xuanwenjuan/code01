package com.snack.processing.config;

import com.snack.processing.common.enums.RoleEnum;
import com.snack.processing.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login", "/auth/register").permitAll()
                        .requestMatchers("/doc.html", "/webjars/**", "/v3/api-docs/**", "/swagger-resources/**").permitAll()
                        .requestMatchers("/category/**").permitAll()
                        .requestMatchers("/material/**").hasAnyRole(
                                RoleEnum.PURCHASER.getRoleName(),
                                RoleEnum.PRODUCTION_LEADER.getRoleName(),
                                RoleEnum.ADMIN.getRoleName()
                        )
                        .requestMatchers("/work-order/**").hasAnyRole(
                                RoleEnum.PROCESS_ENGINEER.getRoleName(),
                                RoleEnum.PRODUCTION_LEADER.getRoleName(),
                                RoleEnum.QC_INSPECTOR.getRoleName(),
                                RoleEnum.ADMIN.getRoleName()
                        )
                        .requestMatchers("/statistics/**").hasAnyRole(
                                RoleEnum.PRODUCTION_LEADER.getRoleName(),
                                RoleEnum.ADMIN.getRoleName()
                        )
                        .requestMatchers("/supplier/**").hasAnyRole(
                                RoleEnum.PURCHASER.getRoleName(),
                                RoleEnum.ADMIN.getRoleName()
                        )
                        .requestMatchers("/equipment/**").hasAnyRole(
                                RoleEnum.PRODUCTION_LEADER.getRoleName(),
                                RoleEnum.PROCESS_ENGINEER.getRoleName(),
                                RoleEnum.ADMIN.getRoleName()
                        )
                        .requestMatchers("/quality-inspection/**").hasAnyRole(
                                RoleEnum.QC_INSPECTOR.getRoleName(),
                                RoleEnum.PRODUCTION_LEADER.getRoleName(),
                                RoleEnum.ADMIN.getRoleName()
                        )
                        .requestMatchers("/finished-goods/**").hasAnyRole(
                                RoleEnum.PRODUCTION_LEADER.getRoleName(),
                                RoleEnum.ADMIN.getRoleName()
                        )
                        .requestMatchers("/stock-check/**").hasAnyRole(
                                RoleEnum.PURCHASER.getRoleName(),
                                RoleEnum.PRODUCTION_LEADER.getRoleName(),
                                RoleEnum.ADMIN.getRoleName()
                        )
                        .requestMatchers("/user/**").hasAnyRole(
                                RoleEnum.ADMIN.getRoleName()
                        )
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
