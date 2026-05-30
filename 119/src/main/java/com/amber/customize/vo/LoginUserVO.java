package com.amber.customize.vo;

import lombok.Data;

@Data
public class LoginUserVO {

    private Long id;

    private String username;

    private String realName;

    private String phone;

    private Integer role;

    private String roleDesc;

    private String token;

}
