package com.snacktrace.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("work_order_material")
public class WorkOrderMaterial {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long workOrderId;
    private Long materialId;
    private Long batchId;
    private String materialName;
    private String batchCode;
    private BigDecimal planQuantity;
    private BigDecimal actualQuantity;
    private BigDecimal unitPrice;
    private BigDecimal totalCost;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @TableLogic
    private Integer deleted;
}
