package com.gearbox.manage.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginVO {
    private Long userId;
    private String username;
    private String realName;
    private String role;
    private String token;
}
