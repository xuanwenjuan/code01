package com.firecontrol.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_material")
public class WorkOrderMaterial extends BaseEntity {

    private Long workOrderId;

    private String orderNo;

    private Long materialId;

    private String materialCode;

    private String materialName;

    private String specification;

    private String unit;

    private BigDecimal requiredQuantity;

    private BigDecimal pickedQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal returnedQuantity;

    private BigDecimal scrapQuantity;

    private String remark;
}
