package com.liquor.brewing.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.liquor.brewing.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("liquor_category")
public class LiquorCategory extends BaseEntity {

    private String categoryCode;

    private String categoryName;

    private Long parentId;

    private String treePath;

    private Integer level;

    private String description;

    private Integer status;

    private Integer sortOrder;

    @TableField(exist = false)
    private List<LiquorCategory> children;
}
