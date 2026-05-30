package com.woodendoor.production.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_cost")
public class ProductionCost extends BaseEntity {
    private Long orderId;
    private String orderNo;
    private BigDecimal woodCost;
    private BigDecimal hardwareCost;
    private BigDecimal paintCost;
    private BigDecimal laborCost;
    private BigDecimal scrapCost;
    private BigDecimal woodWaste;
    private BigDecimal hardwareWaste;
    private BigDecimal paintWaste;
    private BigDecimal woodWasteRate;
    private BigDecimal hardwareWasteRate;
    private BigDecimal paintWasteRate;
    private BigDecimal totalWasteCost;
    private BigDecimal actualCost;
    private BigDecimal totalCost;
    private String remark;

    @TableField(exist = false)
    private List<CostDetail> detailList;
}