package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.household.management.common.entity.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product_cost")
@Schema(description = "单品生产成本实体")
public class ProductCost extends BaseEntity {

    @Schema(description = "工单ID")
    private Long workOrderId;

    @Schema(description = "产品ID")
    private Long productId;

    @Schema(description = "统计月份：yyyy-MM")
    private String statisticsMonth;

    @Schema(description = "生产数量")
    private Integer productionQuantity;

    @Schema(description = "合格数量")
    private Integer qualifiedQuantity;

    @Schema(description = "次品数量")
    private Integer defectiveQuantity;

    @Schema(description = "实际材料成本")
    private BigDecimal actualMaterialCost;

    @Schema(description = "实际人工成本")
    private BigDecimal actualLaborCost;

    @Schema(description = "实际设备损耗成本")
    private BigDecimal actualEquipmentCost;

    @Schema(description = "实际包装成本")
    private BigDecimal actualPackagingCost;

    @Schema(description = "次品报废成本")
    private BigDecimal defectiveScrapCost;

    @Schema(description = "其他成本")
    private BigDecimal otherCost;

    @Schema(description = "总成本")
    private BigDecimal totalCost;

    @Schema(description = "单位成本")
    private BigDecimal unitCost;

    @Schema(description = "材料损耗率(%)")
    private BigDecimal materialLossRate;

    @Schema(description = "次品率(%)")
    private BigDecimal defectiveRate;

    @Schema(description = "产品名称")
    private transient String productName;

    @Schema(description = "工单号")
    private transient String workOrderNo;
}
