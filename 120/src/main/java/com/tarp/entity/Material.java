package com.tarp.entity;

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
    private String materialName;
    private String materialType;
    private String specification;
    private String origin;
    private String batchNo;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal stockQuantity;
    private BigDecimal warningQuantity;
    private Integer status;
    private LocalDateTime expireTime;
    private Integer isOil;
}
