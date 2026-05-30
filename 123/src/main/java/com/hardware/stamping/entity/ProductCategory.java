package com.hardware.stamping.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product_category")
public class ProductCategory extends BaseEntity {

    @NotBlank(message = "类目名称不能为空")
    @Size(max = 100, message = "类目名称长度不能超过100")
    private String categoryName;

    @Size(max = 50, message = "类目编码长度不能超过50")
    private String categoryCode;

    private Long parentId;

    @Min(value = 1, message = "层级最小为1")
    @Max(value = 10, message = "层级最大为10")
    private Integer level;

    @NotNull(message = "排序号不能为空")
    @Min(value = 0, message = "排序号不能小于0")
    private Integer sort;

    @Min(value = 0, message = "优先级不能小于0")
    private Integer priority;

    private Integer status;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;

    @TableField(exist = false)
    private List<ProductCategory> children;
}
