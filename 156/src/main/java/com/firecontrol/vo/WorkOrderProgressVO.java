package com.firecontrol.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkOrderProgressVO {

    private Long id;

    private String orderNo;

    private String productName;

    private BigDecimal planQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal qualifiedQuantity;

    private BigDecimal scrapQuantity;

    private Integer status;

    private String statusName;

    private LocalDateTime planStartTime;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    private Integer totalProcesses;

    private Integer completedProcesses;

    private BigDecimal progress;

    private String currentProcess;

    private List<ProcessProgressVO> processes;

    @Data
    public static class ProcessProgressVO {
        private Long id;
        private String processCode;
        private String processName;
        private Integer sortOrder;
        private Integer status;
        private String statusName;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String operatorName;
        private String inspectionResult;
    }
}
