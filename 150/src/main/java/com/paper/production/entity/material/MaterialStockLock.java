package com.paper.production.entity.material;

import com.baomidou.mybatisplus.annotation.TableName;
import com.paper.production.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_stock_lock")
public class MaterialStockLock extends BaseEntity {

    private String lockNo;
    private Long workOrderId;
    private String orderNo;
    private Long materialId;
    private String materialCode;
    private String materialName;
    private String specification;
    private BigDecimal lockQuantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String batchNo;
    private Integer status;
    private LocalDateTime lockTime;
    private LocalDateTime releaseTime;
    private String operator;
    private String remark;
}
