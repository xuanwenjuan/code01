package com.aluminum.extrusion.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product_category")
public class ProductCategory extends BaseEntity {

    @NotBlank(message = "类目名称不能为空")
    @Size(min = 1, max = 100, message = "类目名称长度必须在1-100个字符之间")
    private String categoryName;

    private Long parentId;

    private Integer level;

    @Size(max = 50, message = "类目编码长度不能超过50个字符")
    private String categoryCode;

    @Size(max = 500, message = "描述长度不能超过500个字符")
    private String description;

    @NotNull(message = "优先级不能为空")
    @Min(value = 0, message = "优先级不能小于0")
    @Max(value = 999, message = "优先级不能大于999")
    private Integer priority;

    private Integer status;
}
