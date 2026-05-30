package com.liquor.brewing.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.liquor.brewing.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("liquor_formula")
public class LiquorFormula extends BaseEntity {

    private String formulaCode;

    private String formulaName;

    private Long categoryId;

    private String description;

    private String brewingProcess;

    private Integer fermentationDays;

    private Integer agingDays;

    private BigDecimal alcoholContent;

    private Integer shelfLife;

    private Integer priority;

    private Integer status;

    @TableField(exist = false)
    private String categoryName;

    @TableField(exist = false)
    private String categoryCode;
}
