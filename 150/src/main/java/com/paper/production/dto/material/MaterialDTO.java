package com.paper.production.dto.material;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialDTO {

    private Long id;

    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    @NotBlank(message = "物料名称不能为空")
    private String materialName;

    @NotBlank(message = "物料类型不能为空")
    private String materialType;

    private String specification;

    @NotBlank(message = "计量单位不能为空")
    private String unit;

    @NotNull(message = "单价不能为空")
    private BigDecimal unitPrice;

    @NotNull(message = "当前库存不能为空")
    private BigDecimal stockQuantity;

    private BigDecimal minStock;
    private BigDecimal maxStock;
    private Integer status;
    private Boolean moistureProof;
    private LocalDate expiryDate;
    private String storageLocation;
    private String supplier;
    private String remark;
}
