package com.woodendoor.production.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_lock")
public class MaterialLock extends BaseEntity {
    private Long orderId;
    private String orderNo;
    private Long materialId;
    private String materialName;
    private String materialType;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private Integer status;
    private LocalDateTime lockTime;
    private LocalDateTime unlockTime;
    private String remark;
}
