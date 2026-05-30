package com.hydraulic.piston.vo;

import lombok.Data;

@Data
public class LoginVO {
    private Long userId;
    private String username;
    private String realName;
    private String token;
    private Integer roleId;
    private String roleName;
}
