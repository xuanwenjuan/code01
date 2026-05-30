package com.firecontrol.entity;

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

    private String materialCode;

    private String materialName;

    private BigDecimal quantity;

    private BigDecimal availableQuantity;

    private LocalDate productionDate;

    private LocalDate expiryDate;

    private Integer qualityStatus;

    private String inspectionReport;

    private LocalDate recheckDate;

    private Integer recheckStatus;

    private String supplier;

    private String warehouseLocation;

    private String remark;
}
