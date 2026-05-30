package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.household.management.common.entity.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("quality_inspection")
@Schema(description = "品质巡检实体")
public class QualityInspection extends BaseEntity {

    @Schema(description = "巡检单号")
    private String inspectionNo;

    @Schema(description = "关联工单ID")
    private Long workOrderId;

    @Schema(description = "产品ID")
    private Long productId;

    @Schema(description = "原料ID")
    private Long materialId;

    @Schema(description = "巡检类型：原料抽检、制程巡检、成品抽检")
    private String inspectionType;

    @Schema(description = "巡检人ID")
    private Long inspectorId;

    @Schema(description = "巡检时间")
    private LocalDateTime inspectionTime;

    @Schema(description = "巡检结果：1-合格 2-不合格")
    private Integer inspectionResult;

    @Schema(description = "巡检项目")
    private String inspectionItems;

    @Schema(description = "不合格描述")
    private String defectiveDescription;

    @Schema(description = "处理建议")
    private String handlingSuggestion;

    @Schema(description = "状态：1-待处理 2-已处理")
    private Integer status;

    @Schema(description = "巡检人姓名")
    private transient String inspectorName;

    @Schema(description = "产品名称")
    private transient String productName;

    @Schema(description = "原料名称")
    private transient String materialName;

    @Schema(description = "工单号")
    private transient String workOrderNo;
}
