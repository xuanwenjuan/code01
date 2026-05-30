package com.watchrepair.admin.vo;

import lombok.Data;

@Data
public class LoginVO {

    private Long userId;

    private String username;

    private String realName;

    private Integer role;

    private String roleDesc;

    private String token;
}