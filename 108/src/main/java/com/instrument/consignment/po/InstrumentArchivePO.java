package com.instrument.consignment.po;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("instrument_archive")
public class InstrumentArchivePO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String traceNo;

    private Long categoryId;

    private String brand;

    private Integer productionYear;

    private String model;

    private String conditionLevel;

    private Integer accessoriesComplete;

    private String accessoriesDesc;

    private String appearanceDesc;

    private String status;

    private Long sellerId;

    private BigDecimal estimatedPrice;

    private BigDecimal salePrice;

    private LocalDateTime lastMaintainTime;

    private LocalDateTime nextMaintainTime;

    private Integer maintainCycleDays;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer isDeleted;
}
