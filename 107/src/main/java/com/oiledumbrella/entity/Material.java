package com.oiledumbrella.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {
    private String materialCode;
    private String materialName;
    private String materialType;
    private String materialQuality;
    private String usePurpose;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal currentStock;
    private BigDecimal lockedStock;
    private BigDecimal availableStock;
    private BigDecimal minStock;
    private String supplier;
    private Integer status;
}
