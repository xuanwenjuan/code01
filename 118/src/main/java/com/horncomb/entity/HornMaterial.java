package com.horncomb.entity;

import com.horncomb.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
public class HornMaterial extends BaseEntity {
    private String batchNo;
    private String hornType;
    private String origin;
    private BigDecimal thickness;
    private String grade;
    private BigDecimal weight;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String stockStatus;
    private Integer warningQuantity;
    private LocalDate expireRemindDate;
    private LocalDate purchaseDate;
    private Long purchaserId;
    private String remark;
}
