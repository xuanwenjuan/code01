package com.hydraulic.piston.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_cost")
@Schema(description = "生产成本实体")
public class ProductionCost extends BaseEntity {

    @Schema(description = "工单ID")
    @TableField("order_id")
    private Long orderId;

    @Schema(description = "工单号")
    @TableField("order_no")
    private String orderNo;

    @Schema(description = "活塞型号")
    @TableField("piston_model")
    private String pistonModel;

    @Schema(description = "生产数量")
    @TableField("quantity")
    private Integer quantity;

    @Schema(description = "原料成本")
    @TableField("material_cost")
    private BigDecimal materialCost;

    @Schema(description = "刀具损耗成本")
    @TableField("tool_cost")
    private BigDecimal toolCost;

    @Schema(description = "能耗成本")
    @TableField("energy_cost")
    private BigDecimal energyCost;

    @Schema(description = "人工成本")
    @TableField("labor_cost")
    private BigDecimal laborCost;

    @Schema(description = "报废损失成本")
    @TableField("scrap_cost")
    private BigDecimal scrapCost;

    @Schema(description = "其他损耗成本")
    @TableField("other_loss_cost")
    private BigDecimal otherLossCost;

    @Schema(description = "总成本")
    @TableField("total_cost")
    private BigDecimal totalCost;

    @Schema(description = "单位成本")
    @TableField("unit_cost")
    private BigDecimal unitCost;

    @Schema(description = "统计年份")
    @TableField("report_year")
    private Integer reportYear;

    @Schema(description = "统计月份")
    @TableField("report_month")
    private Integer reportMonth;

    @Schema(description = "备注")
    @TableField("remark")
    private String remark;
}