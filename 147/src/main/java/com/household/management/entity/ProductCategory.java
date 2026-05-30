package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.household.management.common.entity.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product_category")
@Schema(description = "产品分类实体")
public class ProductCategory extends BaseEntity {

    @Schema(description = "父分类ID")
    private Long parentId;

    @Schema(description = "分类名称")
    private String categoryName;

    @Schema(description = "分类编码")
    private String categoryCode;

    @Schema(description = "分类图标")
    private String icon;

    @Schema(description = "排序")
    private Integer sortOrder;

    @Schema(description = "状态：1-启用 0-禁用")
    private Integer status;

    @Schema(description = "子分类列表")
    private transient List<ProductCategory> children;
}
