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
@TableName("product_bom")
public class ProductBom extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long productId;

    private Long materialId;

    private String materialName;

    private BigDecimal quantity;

    private String remark;
}
