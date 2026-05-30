package com.paper.production.entity.material;

import com.baomidou.mybatisplus.annotation.TableName;
import com.paper.production.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {

    private String materialCode;
    private String materialName;
    private String materialType;
    private String specification;
    private String unit;
    private BigDecimal unitPrice;
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
