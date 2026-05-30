package com.radiator.management.dto;

import lombok.Data;

import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Size;
import java.math.BigDecimal;

@Data
public class MaterialQueryDTO {
    @Size(max = 100, message = "物料名称长度不能超过100")
    private String materialName;

    @Size(max = 50, message = "物料编码长度不能超过50")
    private String materialCode;

    @Size(max = 50, message = "物料类型长度不能超过50")
    private String materialType;

    @Size(max = 100, message = "规格型号长度不能超过100")
    private String specification;

    @Size(max = 20, message = "批次号长度不能超过20")
    private String batchNo;

    private String status;

    @DecimalMin(value = "0", message = "最小库存数量不能小于0")
    private BigDecimal minQuantity;

    @DecimalMin(value = "0", message = "最大库存数量不能小于0")
    private BigDecimal maxQuantity;

    @DecimalMin(value = "0", message = "最小单价不能小于0")
    private BigDecimal minUnitPrice;

    @DecimalMin(value = "0", message = "最大单价不能小于0")
    private BigDecimal maxUnitPrice;

    private Boolean warningOnly;

    private Integer isMoistureProof;

    private Integer page = 1;

    private Integer size = 20;

    private String sortField;

    private String sortOrder;
}
