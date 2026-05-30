package com.hardware.stamping.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_accounting")
public class CostAccounting extends BaseEntity {

    @NotNull(message = "统计日期不能为空")
    private LocalDate accountingDate;

    private Long categoryId;

    @Size(max = 100, message = "产品类目名称长度不能超过100")
    private String categoryName;

    private Long orderId;

    @Size(max = 50, message = "工单编号长度不能超过50")
    private String orderNo;

    @DecimalMin(value = "0", message = "原料成本不能小于0")
    private BigDecimal materialCost;

    @DecimalMin(value = "0", message = "原料损耗成本不能小于0")
    private BigDecimal materialLossCost;

    @DecimalMin(value = "0", message = "模具磨损成本不能小于0")
    private BigDecimal moldWearCost;

    @DecimalMin(value = "0", message = "人工成本不能小于0")
    private BigDecimal laborCost;

    @DecimalMin(value = "0", message = "外协加工支出不能小于0")
    private BigDecimal outsourcingCost;

    @DecimalMin(value = "0", message = "其他成本不能小于0")
    private BigDecimal otherCost;

    @DecimalMin(value = "0", message = "总成本不能小于0")
    private BigDecimal totalCost;

    @DecimalMin(value = "0", message = "生产数量不能小于0")
    private BigDecimal productionQuantity;

    @DecimalMin(value = "0", message = "单位成本不能小于0")
    private BigDecimal unitCost;

    @DecimalMin(value = "0", message = "营收不能小于0")
    private BigDecimal revenue;

    private BigDecimal profit;

    private BigDecimal profitMargin;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
