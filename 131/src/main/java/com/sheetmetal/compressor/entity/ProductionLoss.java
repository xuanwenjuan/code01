package com.sheetmetal.compressor.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("production_loss")
public class ProductionLoss {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String lossNo;
    private Long orderId;
    private String orderNo;
    private Long categoryId;
    private String categoryName;
    private Integer lossType;
    private String lossName;
    private BigDecimal lossQuantity;
    private BigDecimal lossAmount;
    private BigDecimal lossRate;
    private BigDecimal unitPrice;
    private Long handlerId;
    private String handlerName;
    private String remark;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
}
