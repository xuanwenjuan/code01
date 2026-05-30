package com.camping.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("stock_loss")
public class StockLoss extends BaseEntity {

    private Long orderId;

    private String orderNo;

    private Long materialId;

    private String materialName;

    private BigDecimal lossQuantity;

    private Integer lossType;

    private String lossReason;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    private Long operatorId;

    private String operatorName;

    private Integer status;

    private String remark;
}
