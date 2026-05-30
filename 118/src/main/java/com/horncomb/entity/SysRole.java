package com.horncomb.entity;

import com.horncomb.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SysRole extends BaseEntity {
    private String roleCode;
    private String roleName;
    private String description;
}
