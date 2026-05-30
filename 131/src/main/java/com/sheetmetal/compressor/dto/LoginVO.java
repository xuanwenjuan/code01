package com.sheetmetal.compressor.dto;

import lombok.Data;

@Data
public class LoginVO {
    private Long userId;
    private String username;
    private String realName;
    private Integer role;
    private String token;
}
