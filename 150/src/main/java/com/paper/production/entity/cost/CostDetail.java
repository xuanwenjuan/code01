package com.paper.production.entity.cost;

import com.baomidou.mybatisplus.annotation.TableName;
import com.paper.production.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_detail")
public class CostDetail extends BaseEntity {

    private Long costId;
    private Long workOrderId;
    private String orderNo;
    private String costType;
    private String costName;
    private Long materialId;
    private String materialCode;
    private String materialName;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String unit;
    private String specification;
    private String remark;
}
