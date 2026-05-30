package com.woodendoor.production.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {
    private String name;
    private String type;
    private String materialType;
    private String batchCode;
    private BigDecimal quantity;
    private BigDecimal lockedQuantity;
    private String unit;
    private BigDecimal unitPrice;
    private Integer status;
    private String supplier;
    private LocalDateTime inDate;
    private LocalDateTime expireDate;
    private Integer isDamp;
    private LocalDateTime ventilateRemindTime;
    private String remark;
}