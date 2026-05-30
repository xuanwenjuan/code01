package com.hydraulic.piston.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_order")
@Schema(description = "生产工单实体")
public class ProductionOrder extends BaseEntity {

    @Schema(description = "工单号")
    @TableField("order_no")
    private String orderNo;

    @Schema(description = "分类ID")
    @TableField("category_id")
    private Long categoryId;

    @Schema(description = "分类名称")
    @TableField("category_name")
    private String categoryName;

    @Schema(description = "活塞型号")
    @TableField("piston_model")
    private String pistonModel;

    @Schema(description = "生产数量")
    @TableField("quantity")
    private Integer quantity;

    @Schema(description = "原料ID")
    @TableField("material_id")
    private Long materialId;

    @Schema(description = "原料批次")
    @TableField("material_batch")
    private String materialBatch;

    @Schema(description = "原料名称")
    @TableField("material_name")
    private String materialName;

    @Schema(description = "原料使用量")
    @TableField("material_used")
    private BigDecimal materialUsed;

    @Schema(description = "当前工序")
    @TableField("current_process")
    private Integer currentProcess;

    @Schema(description = "工单状态")
    @TableField("status")
    private Integer status;

    @Schema(description = "工艺是否确认")
    @TableField("process_confirmed")
    private Integer processConfirmed;

    @Schema(description = "计划开始时间")
    @TableField("plan_start_time")
    private LocalDateTime planStartTime;

    @Schema(description = "计划完成时间")
    @TableField("plan_end_time")
    private LocalDateTime planEndTime;

    @Schema(description = "实际开始时间")
    @TableField("actual_start_time")
    private LocalDateTime actualStartTime;

    @Schema(description = "实际完成时间")
    @TableField("actual_end_time")
    private LocalDateTime actualEndTime;

    @Schema(description = "加工人ID")
    @TableField("process_user_id")
    private Long processUserId;

    @Schema(description = "加工人姓名")
    @TableField("process_user_name")
    private String processUserName;

    @Schema(description = "质检人ID")
    @TableField("quality_user_id")
    private Long qualityUserId;

    @Schema(description = "质检人姓名")
    @TableField("quality_user_name")
    private String qualityUserName;

    @Schema(description = "合格数量")
    @TableField("qualified_quantity")
    private Integer qualifiedQuantity;

    @Schema(description = "报废数量")
    @TableField("scrap_quantity")
    private Integer scrapQuantity;

    @Schema(description = "备注")
    @TableField("remark")
    private String remark;
}