package com.hydraulic.piston.entity.sys;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hydraulic.piston.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class User extends BaseEntity {
    private String username;
    private String password;
    private String realName;
    private String phone;
    private String email;
    private Integer roleId;
    private Integer status;
}
