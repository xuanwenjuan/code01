package com.aquascape.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_category")
public class MaterialCategory extends BaseEntity {
    private String categoryName;
    private Long parentId;
    private Integer level;
    private Integer sort;
    private Integer status;
    private String icon;
    private String description;

    @TableField(exist = false)
    private List<MaterialCategory> children;
}
