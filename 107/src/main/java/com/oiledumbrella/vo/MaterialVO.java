package com.oiledumbrella.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MaterialVO {
    private Long id;
    private String materialCode;
    private String materialName;
    private String materialType;
    private String materialQuality;
    private String usePurpose;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal currentStock;
    private BigDecimal minStock;
    private String supplier;
    private Integer status;
    private String statusName;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
