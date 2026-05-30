package com.rotor.manufacture.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {
    private String materialName;
    private String materialCode;
    private String materialType;
    private String batchNo;
    private BigDecimal quantity;
    private BigDecimal lockedQuantity;
    private String unit;
    private BigDecimal unitPrice;
    private Integer stockStatus;
    private LocalDateTime productionDate;
    private LocalDateTime expiryDate;
    private String storageCondition;
    private String supplier;
    private String remark;

    public BigDecimal getAvailableQuantity() {
        BigDecimal locked = lockedQuantity != null ? lockedQuantity : BigDecimal.ZERO;
        BigDecimal available = quantity.subtract(locked);
        return available.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : available;
    }
}