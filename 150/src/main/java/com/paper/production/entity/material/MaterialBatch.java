package com.paper.production.entity.material;

import com.baomidou.mybatisplus.annotation.TableName;
import com.paper.production.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_batch")
public class MaterialBatch extends BaseEntity {

    private String batchNo;
    private Long materialId;
    private String materialCode;
    private String materialName;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private LocalDate productionDate;
    private LocalDate expiryDate;
    private LocalDateTime inboundTime;
    private String supplier;
    private String storageLocation;
    private Integer status;
    private String remark;
}
