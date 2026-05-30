package com.snacktrace.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("qc_inspection")
public class QcInspection {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long workOrderId;
    private Long inspectorId;
    private String inspectorName;
    private Integer inspectionStage;
    private Integer inspectionResult;
    private BigDecimal checkQuantity;
    private BigDecimal qualifiedQuantity;
    private BigDecimal defectQuantity;
    private String defectReason;
    private String remark;
    private LocalDateTime inspectionTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @TableLogic
    private Integer deleted;
}
