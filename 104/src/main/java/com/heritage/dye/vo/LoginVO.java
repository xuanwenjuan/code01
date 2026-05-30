package com.heritage.dye.vo;

import lombok.Data;

@Data
public class LoginVO {
    private Long userId;
    private String username;
    private String realName;
    private String role;
    private String token;
}
