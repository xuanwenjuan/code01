package com.stationery.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
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

    private Long processId;

    private String processName;

    private Long materialId;

    private String materialCode;

    private String materialName;

    private String lossType;

    private String lossReason;

    private BigDecimal lossQuantity;

    private String unit;

    private BigDecimal unitPrice;

    private BigDecimal lossAmount;

    private String remark;

    private Long operatorId;

    private String operatorName;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
