package com.leathercraft.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SysUserVO {
    private Long id;
    private String username;
    private String realName;
    private String phone;
    private String role;
    private String roleName;
    private Integer status;
    private String statusName;
    private LocalDateTime createTime;
}
