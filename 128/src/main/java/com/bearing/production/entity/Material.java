package com.bearing.production.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {
    private String materialCode;
    private String batchNo;
    private String materialName;
    private String specification;
    private String materialType;
    private String supplier;
    private BigDecimal unitPrice;
    private BigDecimal stockQuantity;
    private BigDecimal lockedQuantity;
    private String unit;
    private BigDecimal warningQuantity;
    private Integer stockStatus;
    private Integer rustProof;
    private Integer rustProofDays;
    private LocalDateTime inWarehouseTime;
    private LocalDateTime nextRustProofTime;
    private String remark;
}
