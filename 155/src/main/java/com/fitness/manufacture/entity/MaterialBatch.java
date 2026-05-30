package com.fitness.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fitness.manufacture.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_batch")
public class MaterialBatch extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String batchNo;

    private Long materialId;

    private String materialName;

    private BigDecimal quantity;

    private BigDecimal lockedQuantity;

    private BigDecimal unitPrice;

    private LocalDate productionDate;

    private LocalDate expiryDate;

    private Integer status;

    private String warehouseLocation;

    private String remark;
}
