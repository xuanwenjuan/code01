package com.bee.equipment.vo;

import lombok.Data;

@Data
public class LoginUserVO {

    private Long userId;

    private String username;

    private String realName;

    private String phone;

    private String role;

    private String roleDesc;

    private String token;
}
