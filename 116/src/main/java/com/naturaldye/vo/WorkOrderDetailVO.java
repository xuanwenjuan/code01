package com.naturaldye.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkOrderDetailVO {

    private Long id;

    private String orderNo;

    private Long categoryId;

    private String categoryName;

    private String fabricName;

    private String fabricSpec;

    private BigDecimal fabricQuantity;

    private Long assignedUserId;

    private String assignedUserName;

    private Integer status;

    private String statusDesc;

    private LocalDateTime feedingTime;

    private LocalDateTime preprocessFinishTime;

    private LocalDateTime boilingFinishTime;

    private LocalDateTime dyeingFinishTime;

    private LocalDateTime fixingFinishTime;

    private LocalDateTime dryingFinishTime;

    private LocalDateTime cuttingFinishTime;

    private LocalDateTime completedTime;

    private String remarks;

    private List<WorkOrderMaterialVO> materials;

    private CostDetailVO costDetail;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
