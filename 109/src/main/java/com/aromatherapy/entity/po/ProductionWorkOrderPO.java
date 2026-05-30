package com.aromatherapy.entity.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("production_work_order")
public class ProductionWorkOrderPO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private String customerName;

    private String aromaName;

    private Long categoryId;

    private BigDecimal targetQuantity;

    private BigDecimal actualQuantity;

    private String status;

    private Integer isLocked;

    private LocalDateTime formulaConfirmedTime;

    private LocalDateTime mixingStartTime;

    private LocalDateTime mixingEndTime;

    private LocalDateTime agingStartTime;

    private LocalDateTime agingEndTime;

    private LocalDateTime qcTime;

    private String qcResult;

    private LocalDateTime packageTime;

    private LocalDateTime shipTime;

    private Long perfumerId;

    private Long warehouseId;

    private BigDecimal totalMaterialCost;

    private BigDecimal mixingLoss;

    private BigDecimal laborCost;

    private BigDecimal totalCost;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private Integer deleted;
}
