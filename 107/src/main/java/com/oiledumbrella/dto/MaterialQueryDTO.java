package com.oiledumbrella.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialQueryDTO {
    private String materialName;
    private String materialCode;
    private String materialType;
    private String materialQuality;
    private String usePurpose;
    private Integer status;
    
    @DecimalMin(value = "0", message = "最小库存不能小于0")
    private BigDecimal minStock;
    
    @DecimalMin(value = "0", message = "最大库存不能小于0")
    private BigDecimal maxStock;
    
    private String supplier;
    
    @Positive(message = "页码必须为正数")
    private Integer pageNum = 1;
    
    @Positive(message = "每页条数必须为正数")
    private Integer pageSize = 10;
}
