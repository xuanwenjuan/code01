package com.tarp.vo;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class WorkOrderStatusLogVO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long workOrderId;
    private String orderNo;
    private Integer oldStatus;
    private String oldStatusName;
    private Integer newStatus;
    private String newStatusName;
    private Long operatorId;
    private String operatorName;
    private String remark;
    private LocalDateTime createTime;
}
