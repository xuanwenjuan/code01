package com.fitness.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fitness.manufacture.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String materialName;

    private String materialCode;

    private String materialType;

    private String specification;

    private String unit;

    private BigDecimal unitPrice;

    private BigDecimal stockQuantity;

    private BigDecimal warningQuantity;

    private Integer status;

    private Integer shelfLifeDays;

    private String supplier;

    private String remark;
}
