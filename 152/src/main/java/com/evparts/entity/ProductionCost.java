package com.evparts.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("production_cost")
public class ProductionCost {

    private Long id;
    private String costNo;
    private Long workOrderId;
    private Long productId;
    private BigDecimal totalMaterialCost;
    private BigDecimal totalMoldCost;
    private BigDecimal totalEnergyCost;
    private BigDecimal totalLaborCost;
    private BigDecimal totalScrapCost;
    private BigDecimal totalCost;
    private BigDecimal unitCost;
    private LocalDate costDate;
    private Integer status;
    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;

    @TableField(exist = false)
    private String orderNo;

    @TableField(exist = false)
    private String productName;

    @TableField(exist = false)
    private String productCode;

    @TableField(exist = false)
    private List<CostDetail> costDetails;

}
