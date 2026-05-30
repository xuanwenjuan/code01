package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.household.management.common.entity.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product")
@Schema(description = "产品实体")
public class Product extends BaseEntity {

    @Schema(description = "分类ID")
    private Long categoryId;

    @Schema(description = "产品名称")
    private String productName;

    @Schema(description = "产品编码")
    private String productCode;

    @Schema(description = "规格型号")
    private String specification;

    @Schema(description = "单位")
    private String unit;

    @Schema(description = "销售价格")
    private BigDecimal sellingPrice;

    @Schema(description = "成本价格（系统自动核算）")
    private BigDecimal costPrice;

    @Schema(description = "标准材料成本")
    private BigDecimal standardMaterialCost;

    @Schema(description = "标准人工成本")
    private BigDecimal standardLaborCost;

    @Schema(description = "标准制造费用")
    private BigDecimal standardOverheadCost;

    @Schema(description = "单位标准工时（小时）")
    private BigDecimal standardWorkHours;

    @Schema(description = "产品图片")
    private String image;

    @Schema(description = "产品描述")
    private String description;

    @Schema(description = "销售优先级")
    private Integer priority;

    @Schema(description = "状态：1-在售 0-下架停产")
    private Integer status;

    @Schema(description = "分类名称")
    private transient String categoryName;
}
