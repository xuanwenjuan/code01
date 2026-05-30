package com.paper.production.entity.workorder;

import com.baomidou.mybatisplus.annotation.TableName;
import com.paper.production.common.BaseEntity;
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
    private BigDecimal planQuantity;
    private BigDecimal actualQuantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String batchNo;
    private String remark;
}
