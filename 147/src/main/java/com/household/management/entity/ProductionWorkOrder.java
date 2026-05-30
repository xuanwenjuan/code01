package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.household.management.common.entity.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_work_order")
@Schema(description = "生产工单实体")
public class ProductionWorkOrder extends BaseEntity {

    @Schema(description = "工单号")
    private String workOrderNo;

    @Schema(description = "产品ID")
    private Long productId;

    @Schema(description = "生产数量")
    private Integer quantity;

    @Schema(description = "优先级")
    private Integer priority;

    @Schema(description = "计划开始日期")
    private LocalDate planStartDate;

    @Schema(description = "计划完成日期")
    private LocalDate planEndDate;

    @Schema(description = "实际开始时间")
    private LocalDateTime actualStartDate;

    @Schema(description = "实际结束时间")
    private LocalDateTime actualEndDate;

    @Schema(description = "当前工序：PREPARE-备料 INJECTION-注塑 CUTTING-裁剪 ASSEMBLY-组装 QC-质检 PACKAGE-打包 FINISHED-完成")
    private String currentProcess;

    @Schema(description = "状态：1-待排产 2-生产中 3-已暂停 4-已完成 5-已取消")
    private Integer status;

    @Schema(description = "是否超时自动暂停：0-否 1-是")
    private Integer isAutoPaused;

    @Schema(description = "负责人ID")
    private Long operatorId;

    @Schema(description = "备注")
    private String remark;

    @Schema(description = "产品名称")
    private transient String productName;

    @Schema(description = "产品编码")
    private transient String productCode;

    @Schema(description = "负责人姓名")
    private transient String operatorName;

    @Schema(description = "是否超时")
    private transient Boolean isOverdue;
}
