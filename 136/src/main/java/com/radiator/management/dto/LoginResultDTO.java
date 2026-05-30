package com.radiator.management.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResultDTO {
    private Long userId;
    private String username;
    private String realName;
    private String role;
    private String token;
}