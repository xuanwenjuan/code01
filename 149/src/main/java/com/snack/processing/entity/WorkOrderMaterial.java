package com.snack.processing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_material")
public class WorkOrderMaterial extends BaseEntity {

    private Long workOrderId;
    private Long processId;
    private Long materialId;
    private String materialName;
    private String materialCode;
    private String batchNo;
    private BigDecimal planQuantity;
    private BigDecimal actualQuantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private BigDecimal wasteQuantity;
    private String remark;
}
