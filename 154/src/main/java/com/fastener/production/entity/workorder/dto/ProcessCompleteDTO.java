package com.fastener.production.entity.workorder.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProcessCompleteDTO {

    @NotNull(message = "工序记录ID不能为空")
    private Long processId;

    private Integer outputQuantity;

    private Integer scrapQuantity;

    private String inspectionResult;

    private String remark;
}
