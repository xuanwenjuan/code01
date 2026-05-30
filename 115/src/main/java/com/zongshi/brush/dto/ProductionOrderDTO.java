package com.zongshi.brush.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductionOrderDTO {
    private Long id;

    @NotBlank(message = "工单编号不能为空")
    @Length(max = 50, message = "工单编号长度不能超过50")
    private String orderNo;

    @NotNull(message = "笔型类目不能为空")
    private Long categoryId;

    @NotBlank(message = "毛笔名称不能为空")
    private String brushName;

    private String brushSpec;

    @NotNull(message = "计划生产数量不能为空")
    private Integer planQuantity;

    private Integer actualQuantity;

    private Integer priority;

    private Integer orderStatus;

    private Long workerId;

    private String workerName;

    private LocalDateTime startTime;

    private LocalDateTime expectFinishTime;

    private LocalDateTime actualFinishTime;

    private BigDecimal laborCost;

    private BigDecimal processLoss;

    private String remark;

    private List<OrderMaterialDTO> materials;
}
