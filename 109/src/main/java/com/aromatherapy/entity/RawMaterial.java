package com.aromatherapy.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("raw_material")
public class RawMaterial extends BaseEntity {

    private String batchCode;

    private String materialName;

    private String origin;

    private String extractionProcess;

    private BigDecimal purity;

    private Integer shelfLife;

    private LocalDate productionDate;

    private LocalDate expiryDate;

    private BigDecimal stockQuantity;

    private BigDecimal warningQuantity;

    private String unit;

    private BigDecimal unitPrice;

    private Integer status;

    private String remark;
}
