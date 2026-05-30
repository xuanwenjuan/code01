package com.heritage.dye.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MaterialOriginVO {
    private Long id;
    private String originCode;
    private String originName;
    private String region;
    private String harvestSeason;
    private BigDecimal extractContent;
    private BigDecimal annualOutput;
    private BigDecimal currentStock;
    private BigDecimal warningThreshold;
    private Integer status;
    private String remark;
    private LocalDateTime createTime;
    private Boolean warning;
}
