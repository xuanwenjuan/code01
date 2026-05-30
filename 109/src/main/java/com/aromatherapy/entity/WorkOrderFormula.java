package com.aromatherapy.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_formula")
public class WorkOrderFormula extends BaseEntity {

    private Long workOrderId;

    private Long rawMaterialId;

    private String materialName;

    private BigDecimal proportion;

    private BigDecimal dosage;

    private BigDecimal actualUsage;

    private BigDecimal lossRate;
}
