package com.paper.production.dto.material;

import com.paper.production.common.CommonQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
public class MaterialQueryDTO extends CommonQuery {

    private String materialCode;
    private String materialName;
    private String materialType;
    private String specification;
    private Integer status;
    private BigDecimal minStockMin;
    private BigDecimal minStockMax;
    private BigDecimal stockQuantityMin;
    private BigDecimal stockQuantityMax;
    private BigDecimal unitPriceMin;
    private BigDecimal unitPriceMax;
    private Boolean moistureProof;
    private LocalDate expiryDateStart;
    private LocalDate expiryDateEnd;
    private String supplier;
    private String storageLocation;
}
