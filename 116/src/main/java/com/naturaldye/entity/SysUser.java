package com.naturaldye.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.naturaldye.enums.UserRoleEnum;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class SysUser extends BaseEntity {

    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    private String realName;

    private String phone;

    private UserRoleEnum role;

    private Integer status;
}
