package com.spring.manufacturing.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("production_waste")
public class ProductionWaste {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private String workOrderNo;

    private String processCode;

    private String processName;

    private Long materialId;

    private String materialName;

    private String materialBrand;

    private BigDecimal wasteQuantity;

    private String wasteUnit;

    private BigDecimal wasteAmount;

    private String wasteType;

    private String wasteReason;

    private Long operatorId;

    private String operatorName;

    private LocalDateTime recordTime;

    private String remark;
}