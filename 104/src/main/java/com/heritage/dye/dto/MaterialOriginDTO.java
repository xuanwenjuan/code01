package com.heritage.dye.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialOriginDTO {
    private Long id;

    @NotBlank(message = "产地编码不能为空")
    @Size(min = 2, max = 50, message = "产地编码长度必须在2-50之间")
    @Pattern(regexp = "^[A-Z0-9_]+$", message = "产地编码只能包含大写字母、数字和下划线")
    private String originCode;

    @NotBlank(message = "产地名称不能为空")
    @Size(min = 2, max = 100, message = "产地名称长度必须在2-100之间")
    private String originName;

    @Size(max = 200, message = "地域描述长度不能超过200")
    private String region;

    @Size(max = 100, message = "采收时节长度不能超过100")
    private String harvestSeason;

    @NotNull(message = "提炼含量不能为空")
    @DecimalMin(value = "0", message = "提炼含量不能小于0")
    @DecimalMax(value = "100", message = "提炼含量不能超过100")
    private BigDecimal extractContent;

    @NotNull(message = "年产量不能为空")
    @DecimalMin(value = "0", message = "年产量不能小于0")
    @DecimalMax(value = "999999.99", message = "年产量不能超过999999.99")
    private BigDecimal annualOutput;

    @NotNull(message = "当前库存不能为空")
    @DecimalMin(value = "0", message = "当前库存不能小于0")
    @DecimalMax(value = "999999.99", message = "当前库存不能超过999999.99")
    private BigDecimal currentStock;

    @NotNull(message = "预警阈值不能为空")
    @DecimalMin(value = "0", message = "预警阈值不能小于0")
    @DecimalMax(value = "999999.99", message = "预警阈值不能超过999999.99")
    private BigDecimal warningThreshold;

    @Min(value = 0, message = "状态只能是0或1")
    @Max(value = 1, message = "状态只能是0或1")
    private Integer status;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
