package com.leathercraft.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProcessingOrderVO {
    private Long id;
    private String orderNo;
    private Long materialId;
    private String materialBatchNo;
    private String materialName;
    private Long productCategoryId;
    private String categoryName;
    private BigDecimal quantity;
    private String unit;
    private String status;
    private String statusName;
    private Long tannerId;
    private String tannerName;
    private Long cutterId;
    private String cutterName;
    private LocalDateTime softenStartTime;
    private LocalDateTime softenEndTime;
    private Long softenDuration;
    private LocalDateTime tanningStartTime;
    private LocalDateTime tanningEndTime;
    private Long tanningDuration;
    private LocalDateTime dryingStartTime;
    private LocalDateTime dryingEndTime;
    private Long dryingDuration;
    private LocalDateTime coloringStartTime;
    private LocalDateTime coloringEndTime;
    private Long coloringDuration;
    private LocalDateTime cuttingStartTime;
    private LocalDateTime cuttingEndTime;
    private Long cuttingDuration;
    private LocalDateTime qcStartTime;
    private LocalDateTime qcEndTime;
    private Long qcDuration;
    private LocalDateTime expectFinishTime;
    private LocalDateTime actualFinishTime;
    private Long totalDuration;
    private BigDecimal leatherCost;
    private BigDecimal materialCost;
    private BigDecimal laborCost;
    private BigDecimal lossCost;
    private BigDecimal totalCost;
    private String remark;
    private List<OrderMaterialVO> materials;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
