package com.valve.manufacture.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.valve.manufacture.common.BaseEntity;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_cost")
public class ProductionCost extends BaseEntity {

    @NotNull(message = "成本编号不能为空")
    private String costNo;

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @DecimalMin(value = "0", message = "原料成本不能小于0")
    private BigDecimal materialCost;

    @DecimalMin(value = "0", message = "刀具成本不能小于0")
    private BigDecimal toolCost;

    @DecimalMin(value = "0", message = "设备成本不能小于0")
    private BigDecimal equipmentCost;

    @DecimalMin(value = "0", message = "人工成本不能小于0")
    private BigDecimal laborCost;

    @DecimalMin(value = "0", message = "报废成本不能小于0")
    private BigDecimal scrapCost;

    @DecimalMin(value = "0", message = "能耗成本不能小于0")
    private BigDecimal energyCost;

    @DecimalMin(value = "0", message = "总成本不能小于0")
    private BigDecimal totalCost;

    @DecimalMin(value = "0", message = "单位成本不能小于0")
    private BigDecimal unitCost;

    private Integer status;

    private LocalDateTime confirmTime;

    private Long confirmerId;

    private String remark;
}
