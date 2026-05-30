package com.fishing.distribution.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SortingOrderVO {

    private Long id;

    private String orderNo;

    private Long boatId;

    private String boatCode;

    private String boatName;

    private Long teamId;

    private String teamName;

    private LocalDateTime arrivalTime;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BigDecimal totalWeight;

    private BigDecimal sortedWeight;

    private BigDecimal lossWeight;

    private BigDecimal coldChainCost;

    private BigDecimal laborCost;

    private BigDecimal totalCost;

    private Integer status;

    private String statusDesc;

    private Integer warningStatus;

    private String warningStatusDesc;

    private LocalDateTime warningTime;

    private String remark;

    private Long createBy;

    private String createByName;

    private LocalDateTime createTime;

    private List<SortingOrderDetailVO> details;
}
