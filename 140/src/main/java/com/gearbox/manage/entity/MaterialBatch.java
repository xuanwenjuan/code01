package com.gearbox.manage.entity;

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
    private BigDecimal usedQuantity;
    private LocalDate inboundDate;
    private LocalDate expirationDate;
    private String warehouseLocation;
    private String status;
    private String remark;
}
