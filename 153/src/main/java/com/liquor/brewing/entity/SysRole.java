package com.liquor.brewing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.liquor.brewing.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_role")
public class SysRole extends BaseEntity {

    private String roleCode;

    private String roleName;

    private String description;

    private Integer status;

    private Integer sortOrder;
}
