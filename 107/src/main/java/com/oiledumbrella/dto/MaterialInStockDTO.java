package com.oiledumbrella.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialInStockDTO {
    @NotNull(message = "原料ID不能为空")
    private Long materialId;
    
    @NotBlank(message = "批次编号不能为空")
    private String batchCode;
    
    @NotNull(message = "入库数量不能为空")
    @DecimalMin(value = "0.01", message = "入库数量必须大于0")
    private BigDecimal quantity;
    
    @NotNull(message = "单价不能为空")
    @DecimalMin(value = "0.01", message = "单价必须大于0")
    private BigDecimal unitPrice;
    
    private LocalDate purchaseDate;
    
    private LocalDate expiryDate;
    
    private String supplier;
    
    private String remark;
}
