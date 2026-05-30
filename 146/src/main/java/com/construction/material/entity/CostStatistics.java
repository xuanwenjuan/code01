package com.construction.material.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("cost_statistics")
public class CostStatistics {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String statisticsNo;

    private String projectName;

    private LocalDateTime statisticsDate;

    private BigDecimal mainMaterialCost;

    private BigDecimal auxiliaryMaterialCost;

    private BigDecimal transportationCost;

    private BigDecimal laborCost;

    private BigDecimal wasteCost;

    private BigDecimal totalCost;

    private Integer statisticsType;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableField(fill = FieldFill.INSERT)
    private Long createBy;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateBy;

    @TableLogic
    private Integer deleted;
}
