package com.liquor.brewing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.liquor.brewing.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_type")
public class MaterialType extends BaseEntity {

    private String typeCode;

    private String typeName;

    private String description;

    private Integer sortOrder;
}
