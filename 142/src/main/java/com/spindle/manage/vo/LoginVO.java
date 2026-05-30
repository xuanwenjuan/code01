package com.spindle.manage.vo;

import lombok.Data;

import java.util.List;

@Data
public class LoginVO {

    private Long userId;

    private String username;

    private String realName;

    private String token;

    private List<String> roles;

    private List<String> permissions;

}
