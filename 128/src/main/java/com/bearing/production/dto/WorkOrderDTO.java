package com.bearing.production.dto;

import com.bearing.production.annotation.ValidCategory;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class WorkOrderDTO {

    @NotNull(message = "品类ID不能为空")
    @ValidCategory(message = "品类不存在或已下线，无法创建工单")
    private Long categoryId;

    private String categoryName;

    @NotNull(message = "生产数量不能为空")
    @DecimalMin(value = "0.01", message = "生产数量必须大于0")
    private BigDecimal quantity;

    @NotNull(message = "计划开始时间不能为空")
    private LocalDateTime planStartTime;

    @NotNull(message = "计划完成时间不能为空")
    private LocalDateTime planEndTime;

    private Long materialId;
    private String materialName;
    private String processEngineer;
    private String lineLeader;
    private String qualityInspector;
    private String remark;

    public void validateTime() {
        if (planEndTime.isBefore(planStartTime)) {
            throw new IllegalArgumentException("计划完成时间不能早于开始时间");
        }
    }
}
