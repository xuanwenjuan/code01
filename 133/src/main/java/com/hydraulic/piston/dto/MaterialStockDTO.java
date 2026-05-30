package com.hydraulic.piston.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Schema(description = "棒料原料库存DTO")
public class MaterialStockDTO {

    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "原料类型", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "原料类型不能为空")
    @Size(max = 50, message = "原料类型长度不能超过50个字符")
    private String materialType;

    @Schema(description = "原料名称", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "原料名称不能为空")
    @Size(max = 100, message = "原料名称长度不能超过100个字符")
    private String materialName;

    @Schema(description = "钢材材质牌号")
    @Size(max = 50, message = "钢材材质牌号长度不能超过50个字符")
    private String steelGrade;

    @Schema(description = "规格型号")
    @Size(max = 200, message = "规格型号长度不能超过200个字符")
    private String specification;

    @Schema(description = "数量", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "数量不能为空")
    private BigDecimal quantity;

    @Schema(description = "单位")
    @Size(max = 20, message = "单位长度不能超过20个字符")
    private String unit;

    @Schema(description = "单价")
    private BigDecimal unitPrice;

    @Schema(description = "库存状态")
    private Integer stockStatus;

    @Schema(description = "供应商")
    @Size(max = 200, message = "供应商长度不能超过200个字符")
    private String supplier;

    @Schema(description = "入库日期")
    private LocalDate inboundDate;

    @Schema(description = "有效期至")
    private LocalDate expiryDate;

    @Schema(description = "存放位置")
    @Size(max = 100, message = "存放位置长度不能超过100个字符")
    private String warehouseLocation;

    @Schema(description = "备注")
    @Size(max = 500, message = "备注长度不能超过500个字符")
    private String remark;
}
