package com.snack.processing.dto.quality;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class QualityInspectionAddDTO {

    private Long workOrderId;
    private String workOrderNo;
    private String processCode;
    private String processName;

    @NotNull(message = "质检类型不能为空")
    private Integer inspectionType;

    @NotNull(message = "质检结果不能为空")
    private Integer inspectionResult;

    private BigDecimal sampleQuantity;
    private BigDecimal qualifiedQuantity;
    private BigDecimal unqualifiedQuantity;

    @Length(max = 500, message = "不合格原因长度不能超过500")
    private String unqualifiedReason;

    private Long inspectorId;
    private String inspectorName;
    private LocalDateTime inspectionTime;

    @Length(max = 500, message = "备注长度不能超过500")
    private String remark;
}
