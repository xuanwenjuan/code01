package com.fastener.production.entity.material;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fastener.production.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("metal_material")
public class MetalMaterial extends BaseEntity {

    private String materialName;

    private String materialCode;

    private Integer materialType;

    private String specification;

    private String materialGrade;

    private String origin;

    private String supplier;

    private String unit;

    private BigDecimal unitPrice;

    private BigDecimal warningQuantity;

    private Integer rustProofCycle;

    private Integer status;

    private String remark;
}
