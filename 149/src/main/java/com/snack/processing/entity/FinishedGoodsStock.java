package com.snack.processing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("finished_goods_stock")
public class FinishedGoodsStock extends BaseEntity {

    private Long workOrderId;
    private String workOrderNo;
    private Long snackCategoryId;
    private String snackCategoryName;
    private String productName;
    private String batchNo;
    private BigDecimal totalQuantity;
    private BigDecimal availableQuantity;
    private BigDecimal lockedQuantity;
    private BigDecimal outQuantity;
    private String unit;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private LocalDate productionDate;
    private LocalDate expireDate;
    private String warehouse;
    private String location;
    private Integer stockStatus;
    private String remark;
}
