package com.fishing.distribution.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class LoginVO {

    private String token;

    private Long userId;

    private String username;

    private String realName;

    private List<String> roles;

    private LocalDateTime loginTime;
}
