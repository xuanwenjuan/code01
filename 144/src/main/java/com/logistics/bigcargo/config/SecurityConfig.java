package com.logistics.bigcargo.config;

import com.logistics.bigcargo.filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
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
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()

                        .requestMatchers("/api/categories/**").hasAnyRole("WAREHOUSE_ADMIN", "DISPATCHER")

                        .requestMatchers("/api/inventory/**").hasAnyRole("WAREHOUSE_ADMIN", "SORTER")
                        .requestMatchers("/api/inventory/add", "/api/inventory/update/**", "/api/inventory/delete/**")
                            .hasRole("WAREHOUSE_ADMIN")

                        .requestMatchers("/api/dispatch-orders/**").hasAnyRole("WAREHOUSE_ADMIN", "DISPATCHER", "SORTER", "DRIVER")
                        .requestMatchers("/api/dispatch-orders/create", "/api/dispatch-orders/assign/**")
                            .hasRole("DISPATCHER")
                        .requestMatchers("/api/dispatch-orders/sort/**").hasRole("SORTER")
                        .requestMatchers("/api/dispatch-orders/load/**", "/api/dispatch-orders/deliver/**",
                                "/api/dispatch-orders/sign/**").hasRole("DRIVER")

                        .requestMatchers("/api/logistics-costs/**").hasAnyRole("WAREHOUSE_ADMIN", "FINANCE")
                        .requestMatchers("/api/logistics-costs/statistics", "/api/logistics-costs/generate-report")
                            .hasRole("FINANCE")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
