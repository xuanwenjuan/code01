package com.oiledumbrella.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CustomOrderDetailVO {
    private Long id;
    private String orderNo;
    private String customerName;
    private String customerPhone;
    private Long styleId;
    private String styleName;
    private String colorRequirement;
    private String patternDesign;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private BigDecimal deposit;
    private Integer depositStatus;
    private String depositStatusName;
    private LocalDateTime depositPayTime;
    private BigDecimal remainingAmount;
    private String orderStatus;
    private String orderStatusName;
    private Long operatorId;
    private String operatorName;
    private Long artisanId;
    private String artisanName;
    private LocalDate estimatedFinishDate;
    private LocalDate actualFinishDate;
    private BigDecimal laborCostTotal;
    private BigDecimal materialCostTotal;
    private BigDecimal scrapCostTotal;
    private String remark;
    private List<OrderMaterialVO> materials;
    private List<OrderFlowLogVO> flowLogs;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
