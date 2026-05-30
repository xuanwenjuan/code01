package com.foundry.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("defect_handle")
public class DefectHandle extends BaseEntity {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    private String workOrderNo;

    @NotBlank(message = "处理类型不能为空")
    private String handleType;

    @NotNull(message = "处理数量不能为空")
    @Positive(message = "处理数量必须大于0")
    private Integer handleQuantity;

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal energyCost;

    private BigDecimal totalLoss;

    private String defectReason;

    private String handleMethod;

    private String status;

    private String remark;
}
