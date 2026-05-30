package com.naturaldye.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.naturaldye.enums.CategoryStatusEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("color_category")
public class ColorCategory extends BaseEntity {

    @NotBlank(message = "类目名称不能为空")
    private String categoryName;

    private Long parentId;

    @NotNull(message = "排序不能为空")
    private Integer sortOrder;

    private CategoryStatusEnum status;

    private String colorCode;

    private String description;

    @TableField(exist = false)
    private List<ColorCategory> children;
}
