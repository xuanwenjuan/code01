package com.leathercraft.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("processing_order")
public class ProcessingOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private Long materialId;
    private String materialBatchNo;
    private Long productCategoryId;
    private BigDecimal quantity;
    private String unit;
    private String status;
    private Long tannerId;
    private Long cutterId;
    private LocalDateTime softenStartTime;
    private LocalDateTime softenEndTime;
    private LocalDateTime tanningStartTime;
    private LocalDateTime tanningEndTime;
    private LocalDateTime dryingStartTime;
    private LocalDateTime dryingEndTime;
    private LocalDateTime coloringStartTime;
    private LocalDateTime coloringEndTime;
    private LocalDateTime cuttingStartTime;
    private LocalDateTime cuttingEndTime;
    private LocalDateTime qcStartTime;
    private LocalDateTime qcEndTime;
    private LocalDateTime expectFinishTime;
    private LocalDateTime actualFinishTime;
    private BigDecimal actualQuantity;
    private BigDecimal lossQuantity;
    private BigDecimal leatherCost;
    private BigDecimal materialCost;
    private BigDecimal laborCost;
    private BigDecimal lossCost;
    private BigDecimal totalCost;
    private String remark;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer deleted;
}
