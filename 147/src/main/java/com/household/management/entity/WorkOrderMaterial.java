package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("work_order_material")
@Schema(description = "工单用料明细实体")
public class WorkOrderMaterial implements Serializable {

    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "工单ID")
    private Long workOrderId;

    @Schema(description = "原料ID")
    private Long materialId;

    @Schema(description = "批次号")
    private String batchNo;

    @Schema(description = "需求数量")
    private BigDecimal requiredQuantity;

    @Schema(description = "实际领用数量")
    private BigDecimal actualQuantity;

    @Schema(description = "单价")
    private BigDecimal unitPrice;

    @Schema(description = "总金额")
    private BigDecimal totalAmount;

    @Schema(description = "状态：1-待领料 2-已领料")
    private Integer status;

    @Schema(description = "锁定状态：0-未锁定 1-已锁定")
    private Integer lockedStatus;

    @Schema(description = "锁定时间")
    private LocalDateTime lockedTime;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    @Schema(description = "原料名称")
    private transient String materialName;

    @Schema(description = "原料编码")
    private transient String materialCode;

    @Schema(description = "单位")
    private transient String unit;
}
