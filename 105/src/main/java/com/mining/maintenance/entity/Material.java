package com.mining.maintenance.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {

    private String materialCode;

    private String materialName;

    private String materialType;

    private String specification;

    private String unit;

    private BigDecimal unitPrice;

    private Integer stockQuantity;

    private String miningArea;

    private String location;

    private Integer status;

    private String remarks;
}