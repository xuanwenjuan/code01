package com.fishing.distribution.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SortingLossRecordDTO {

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    private String orderNo;

    @NotNull(message = "类目ID不能为空")
    private Long categoryId;

    private String categoryName;

    @NotBlank(message = "损耗类型不能为空")
    @Pattern(regexp = "^(DAMAGE|DECAY|MISSING|OTHER)$", message = "损耗类型不合法")
    private String lossType;

    @NotNull(message = "损耗重量不能为空")
    @DecimalMin(value = "0.01", message = "损耗重量必须大于0")
    private BigDecimal lossWeight;

    private BigDecimal lossAmount;

    @Size(max = 500, message = "损耗原因长度不能超过500字符")
    private String lossReason;

    @Size(max = 500, message = "备注长度不能超过500字符")
    private String remark;
}
