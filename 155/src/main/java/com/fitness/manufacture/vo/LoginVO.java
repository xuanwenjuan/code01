package com.fitness.manufacture.vo;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class LoginVO implements Serializable {

    private Long userId;

    private String username;

    private String realName;

    private String avatar;

    private String postCode;

    private String postName;

    private List<String> roleCodes;

    private List<String> permissions;

    private String token;

    private String tokenType;

    private Long expiresIn;
}
