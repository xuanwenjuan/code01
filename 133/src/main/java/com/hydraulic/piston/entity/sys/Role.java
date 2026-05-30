package com.hydraulic.piston.entity.sys;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hydraulic.piston.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_role")
public class Role extends BaseEntity {
    private String roleName;
    private String roleCode;
    private String description;
    private Integer status;
}
