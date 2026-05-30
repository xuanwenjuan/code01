package com.valve.manufacture.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.valve.manufacture.common.BaseEntity;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product_category")
public class ProductCategory extends BaseEntity {

    private Long parentId;

    @NotBlank(message = "分类名称不能为空")
    private String categoryName;

    private String categoryCode;

    private Integer priority;

    private Integer status;

    private String remark;

    @TableField(exist = false)
    private List<ProductCategory> children;
}
