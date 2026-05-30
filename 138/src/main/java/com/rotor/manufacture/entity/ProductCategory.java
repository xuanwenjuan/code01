package com.rotor.manufacture.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product_category")
public class ProductCategory extends BaseEntity {
    private String categoryName;
    private String categoryCode;
    private Long parentId;
    private Integer level;
    private Integer sort;
    private Integer priority;
    private Integer status;
    private String description;

    @TableField(exist = false)
    private List<ProductCategory> children;
}