package com.oiledumbrella.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_batch")
public class MaterialBatch extends BaseEntity {
    private String batchCode;
    private Long materialId;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private LocalDate purchaseDate;
    private LocalDate expiryDate;
    private Long operatorId;
    private String remark;
    private Integer status;
}
