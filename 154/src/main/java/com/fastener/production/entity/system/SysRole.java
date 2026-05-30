package com.fastener.production.entity.system;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fastener.production.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_role")
public class SysRole extends BaseEntity {

    private String roleName;

    private String roleCode;

    private Integer status;

    private String remark;
}
