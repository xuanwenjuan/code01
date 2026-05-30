package com.sheetmetal.compressor.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material_lock")
public class MaterialLock {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String lockNo;
    private Long orderId;
    private String orderNo;
    private Long materialId;
    private String materialName;
    private String materialCode;
    private String batchNo;
    private BigDecimal lockQuantity;
    private Integer lockStatus;
    private Long operatorId;
    private String operatorName;
    private String remark;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
}
