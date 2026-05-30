package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("bom_detail")
public class BomDetail extends BaseEntity {

    private Long bomId;

    private String bomCode;

    private Long materialId;

    private String materialCode;

    private String materialName;

    private String materialSpec;

    private BigDecimal quantity;

    private String unit;

    private Integer sort;

    private String remark;
}
