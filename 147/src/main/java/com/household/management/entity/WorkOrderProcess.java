package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("work_order_process")
@Schema(description = "工单工序记录实体")
public class WorkOrderProcess implements Serializable {

    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "工单ID")
    private Long workOrderId;

    @Schema(description = "工序编码")
    private String processCode;

    @Schema(description = "工序名称")
    private String processName;

    @Schema(description = "操作人ID")
    private Long operatorId;

    @Schema(description = "开始时间")
    private LocalDateTime startTime;

    @Schema(description = "结束时间")
    private LocalDateTime endTime;

    @Schema(description = "加工数量")
    private Integer quantity;

    @Schema(description = "合格数量")
    private Integer qualifiedQuantity;

    @Schema(description = "次品数量")
    private Integer defectiveQuantity;

    @Schema(description = "状态：1-进行中 2-已完成")
    private Integer status;

    @Schema(description = "备注")
    private String remark;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    @Schema(description = "操作人姓名")
    private transient String operatorName;
}
