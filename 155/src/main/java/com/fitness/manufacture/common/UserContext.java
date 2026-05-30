package com.fitness.manufacture.common;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class UserContext implements Serializable {

    private Long userId;

    private String username;

    private String realName;

    private String postCode;

    private String postName;

    private List<String> roleCodes;

    private List<String> permissions;

    private String token;
}
