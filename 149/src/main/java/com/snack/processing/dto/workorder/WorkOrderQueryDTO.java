package com.snack.processing.dto.workorder;

import com.snack.processing.common.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
public class WorkOrderQueryDTO extends PageQuery {

    private String orderNo;
    private Long snackCategoryId;
    private String productName;
    private Integer status;
    private Integer isOverdue;
    private LocalDateTime planStartTimeStart;
    private LocalDateTime planStartTimeEnd;
    private Long processEnginnerId;
    private Long productionLeaderId;
    private Long qcInspectorId;
}
