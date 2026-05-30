package com.aluminum.extrusion.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order")
public class WorkOrder extends BaseEntity {

    private String orderNo;

    @NotNull(message = "产品类目ID不能为空")
    private Long categoryId;

    private String categoryName;

    @NotNull(message = "铝棒原料ID不能为空")
    private Long stockId;

    private String batchNo;

    private String alloyGrade;

    @NotNull(message = "计划产量不能为空")
    @DecimalMin(value = "0.01", message = "计划产量必须大于0")
    @DecimalMax(value = "999999.99", message = "计划产量超出范围")
    private BigDecimal planQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal scrapQuantity;

    private BigDecimal heatingLoss;

    private BigDecimal extrusionLoss;

    private BigDecimal cuttingLoss;

    private BigDecimal surfaceLoss;

    private Integer status;

    private String extrusionProcess;

    private String moldCode;

    private BigDecimal heatingTemp;

    private BigDecimal extrusionSpeed;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String operator;

    @Size(max = 500, message = "备注长度不能超过500个字符")
    private String remark;
}
