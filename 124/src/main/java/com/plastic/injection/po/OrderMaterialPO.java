package com.plastic.injection.po;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_material")
public class OrderMaterialPO extends BasePO {

    private Long orderId;

    private Long materialId;

    private String materialName;

    private String materialCode;

    private String batchNo;

    private BigDecimal planQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal unitPrice;

    private BigDecimal totalCost;

    private BigDecimal wasteQuantity;

    private String unit;

    private Integer isLocked;

    private String remark;
}
