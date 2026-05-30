package com.aquascape.vo;

import lombok.Data;

@Data
public class LoginVO {
    private String token;
    private Long userId;
    private String username;
    private String realName;
    private Long roleId;
    private String roleCode;
    private String roleName;
}
