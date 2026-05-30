package com.tarp.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkOrderVO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String orderNo;
    private Long categoryId;
    private String categoryName;
    private Integer quantity;
    private Integer status;
    private String statusName;

    private BigDecimal materialCost;
    private BigDecimal laborCost;
    private BigDecimal totalCost;
    private BigDecimal lossCost;
    private BigDecimal comprehensiveCost;

    private LocalDateTime expectTime;
    private LocalDateTime startTime;
    private LocalDateTime finishTime;
    private String remark;

    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    private List<WorkOrderMaterialVO> materials;
    private List<WorkOrderStatusLogVO> statusLogs;
}
