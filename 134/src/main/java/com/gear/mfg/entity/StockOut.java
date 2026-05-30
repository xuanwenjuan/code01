package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("stock_out")
public class StockOut extends BaseEntity {

    private String outNo;

    private Integer outType;

    private Long warehouseId;

    private String warehouseName;

    private Long orderId;

    private String orderNo;

    private String receiver;

    private String receiverPhone;

    private LocalDate planDate;

    private LocalDate actualDate;

    private Integer status;

    private BigDecimal totalAmount;

    private String auditor;

    private LocalDate auditDate;

    private String remark;
}
