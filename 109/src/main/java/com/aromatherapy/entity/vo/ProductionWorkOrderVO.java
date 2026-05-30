package com.aromatherapy.entity.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductionWorkOrderVO {

    private Long id;

    private String orderNo;

    private String customerName;

    private String aromaName;

    private Long categoryId;

    private String categoryName;

    private BigDecimal targetQuantity;

    private BigDecimal actualQuantity;

    private String status;

    private String statusDesc;

    private Integer isLocked;

    private LocalDateTime formulaConfirmedTime;

    private LocalDateTime mixingStartTime;

    private LocalDateTime mixingEndTime;

    private LocalDateTime agingStartTime;

    private LocalDateTime agingEndTime;

    private LocalDateTime qcTime;

    private String qcResult;

    private LocalDateTime packageTime;

    private LocalDateTime shipTime;

    private Long perfumerId;

    private String perfumerName;

    private Long warehouseId;

    private String warehouseName;

    private BigDecimal totalMaterialCost;

    private BigDecimal mixingLoss;

    private BigDecimal laborCost;

    private BigDecimal totalCost;

    private String remark;

    private List<FormulaItemVO> formulaItems;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
