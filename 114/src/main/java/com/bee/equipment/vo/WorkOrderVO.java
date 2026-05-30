package com.bee.equipment.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class WorkOrderVO extends BaseVO {

    private String orderNo;

    private Long equipmentCategoryId;

    private String equipmentCategoryName;

    private Integer quantity;

    private String status;

    private String statusDesc;

    private Long assemblerId;

    private String assemblerName;

    private LocalDateTime pickTime;

    private LocalDateTime finishTime;

    private LocalDateTime deadline;

    private String remark;

    private List<WorkOrderMaterialVO> materials;

    private BigDecimal totalMaterialCost;

    private BigDecimal laborCost;

    private BigDecimal totalCost;
}
