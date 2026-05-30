package com.camping.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("stock_lock")
public class StockLock extends BaseEntity {

    private Long orderId;

    private String orderNo;

    private Long materialId;

    private String materialName;

    private BigDecimal lockQuantity;

    private Integer lockType;

    private Integer status;

    private LocalDateTime expireTime;

    private String remark;
}
