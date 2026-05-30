package com.hydraulic.piston.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QualityCheckDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "合格数量不能为空")
    private Integer qualifiedQuantity;

    private Integer scrapQuantity;

    private Long qualityUserId;

    private String qualityUserName;

    private String remark;
}
