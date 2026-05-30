package com.paper.production.entity.system;

import com.baomidou.mybatisplus.annotation.TableName;
import com.paper.production.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class User extends BaseEntity {

    private String username;
    private String password;
    private String nickname;
    private String phone;
    private String email;
    private String avatar;
    private String role;
    private Integer status;
    private String remark;
}
