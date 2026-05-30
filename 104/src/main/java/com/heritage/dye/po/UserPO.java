package com.heritage.dye.po;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class UserPO extends BasePO {
    private String username;
    private String password;
    private String realName;
    private String phone;
    private String email;
    private String role;
    private Integer status;
}
