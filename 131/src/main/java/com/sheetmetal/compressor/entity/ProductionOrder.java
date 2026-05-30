package com.sheetmetal.compressor.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("production_order")
public class ProductionOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private Long categoryId;
    private String categoryName;
    private Integer planQuantity;
    private Integer actualQuantity;
    private Integer defectiveQuantity;
    private Integer status;
    private LocalDate planStartDate;
    private LocalDate planEndDate;
    private LocalDateTime actualStartDate;
    private LocalDateTime actualEndDate;
    private Long processEngineerId;
    private String processEngineerName;
    private Long productionLeaderId;
    private String productionLeaderName;
    private Long inspectorId;
    private String inspectorName;
    private Integer processConfirmed;
    private LocalDateTime processEngineerTime;
    private Integer priority;
    private String remark;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
    @TableLogic
    private Integer deleted;
}
