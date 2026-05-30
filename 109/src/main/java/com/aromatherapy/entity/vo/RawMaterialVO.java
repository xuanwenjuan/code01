package com.aromatherapy.entity.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class RawMaterialVO {

    private Long id;

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

    private Integer stockStatus;

    private String stockStatusDesc;

    private Integer status;

    private String statusDesc;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
