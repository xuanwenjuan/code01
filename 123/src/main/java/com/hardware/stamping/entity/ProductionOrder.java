package com.hardware.stamping.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_order")
public class ProductionOrder extends BaseEntity {

    @Size(max = 50, message = "工单编号长度不能超过50")
    private String orderNo;

    @NotNull(message = "产品类目ID不能为空")
    private Long categoryId;

    @Size(max = 100, message = "产品类目名称长度不能超过100")
    private String categoryName;

    @NotNull(message = "生产数量不能为空")
    @DecimalMin(value = "0", message = "生产数量不能小于0", inclusive = false)
    private BigDecimal quantity;

    private Long materialId;

    @Size(max = 100, message = "原料批次编码长度不能超过100")
    private String materialBatchCode;

    @Size(max = 50, message = "模具编号长度不能超过50")
    private String moldNo;

    @Size(max = 50, message = "机器编号长度不能超过50")
    private String machineNo;

    @NotNull(message = "工单状态不能为空")
    @Min(value = 1, message = "工单状态值不正确")
    @Max(value = 9, message = "工单状态值不正确")
    private Integer status;

    private LocalDateTime planStartTime;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    @DecimalMin(value = "0", message = "生产工时不能小于0")
    private BigDecimal productionHours;

    @DecimalMin(value = "0", message = "合格数量不能小于0")
    private BigDecimal qualifiedQuantity;

    @DecimalMin(value = "0", message = "报废数量不能小于0")
    private BigDecimal scrapQuantity;

    @Size(max = 50, message = "操作员长度不能超过50")
    private String operator;

    @Size(max = 50, message = "技术员长度不能超过50")
    private String technician;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
