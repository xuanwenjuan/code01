package com.sheetmetal.compressor.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("material")
public class Material {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String materialName;
    private String materialCode;
    private String batchNo;
    private Integer materialType;
    private String materialTexture;
    private String spec;
    private BigDecimal thickness;
    private BigDecimal width;
    private BigDecimal length;
    private String unit;
    private BigDecimal totalQuantity;
    private BigDecimal availableQuantity;
    private BigDecimal warningQuantity;
    private BigDecimal unitPrice;
    private Integer status;
    private Integer isOutdoor;
    private Integer moistureProofDays;
    private LocalDate lastCheckDate;
    private LocalDate nextCheckDate;
    private String warehouseLocation;
    private String supplier;
    private LocalDate inboundDate;
    private String description;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
    @TableLogic
    private Integer deleted;
}
