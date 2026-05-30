package com.spindle.manage.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("production_loss_record")
public class ProductionLossRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private String orderNo;

    private Integer processCode;

    private String processName;

    private String lossType;

    private BigDecimal lossQuantity;

    private BigDecimal lossAmount;

    private String unit;

    private String materialName;

    private String materialType;

    private String remark;

    private Long operatorId;

    private String operatorName;

    private LocalDateTime createTime;

}
