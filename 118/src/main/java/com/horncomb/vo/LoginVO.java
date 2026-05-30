package com.horncomb.vo;

import lombok.Data;

@Data
public class LoginVO {
    private Long userId;
    private String username;
    private String realName;
    private String roleCode;
    private String roleName;
    private String token;
}
