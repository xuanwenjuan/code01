package com.snack.processing.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

@Data
public class UserAddDTO {

    @NotBlank(message = "用户名不能为空")
    @Length(max = 50, message = "用户名长度不能超过50")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Length(min = 6, max = 50, message = "密码长度必须在6-50之间")
    private String password;

    @NotBlank(message = "真实姓名不能为空")
    @Length(max = 50, message = "真实姓名长度不能超过50")
    private String realName;

    @Length(max = 20, message = "手机号长度不能超过20")
    private String phone;

    @Length(max = 100, message = "邮箱长度不能超过100")
    private String email;

    @NotNull(message = "角色不能为空")
    private Integer role;

    private Integer status;

    @Length(max = 255, message = "头像长度不能超过255")
    private String avatar;

    @Length(max = 500, message = "备注长度不能超过500")
    private String remark;
}
