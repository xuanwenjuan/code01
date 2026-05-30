package com.horncomb.entity;

import com.horncomb.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class CombCategory extends BaseEntity {
    private Long parentId;
    private String categoryName;
    private String categoryCode;
    private Integer level;
    private Integer sortOrder;
    private Integer status;
}
