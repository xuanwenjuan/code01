package com.paper.production.entity.quality;

import com.baomidou.mybatisplus.annotation.TableName;
import com.paper.production.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("defective_product")
public class DefectiveProduct extends BaseEntity {

    private String defectiveNo;
    private Long workOrderId;
    private String orderNo;
    private Long productCategoryId;
    private String productCategoryName;
    private Long processId;
    private String processName;
    private String processType;
    private BigDecimal defectiveQuantity;
    private BigDecimal totalQuantity;
    private BigDecimal defectiveRate;
    private String defectiveType;
    private String defectiveReason;
    private String handleMethod;
    private BigDecimal handleCost;
    private BigDecimal scrapValue;
    private BigDecimal lossAmount;
    private String inspector;
    private String operator;
    private Integer status;
    private String remark;
}
