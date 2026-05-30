package com.spindle.manage.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MaterialQueryDTO {

    private String materialName;

    private String materialType;

    private String specification;

    private String batchNo;

    private Integer inventoryStatus;

    private BigDecimal minQuantity;

    private BigDecimal maxQuantity;

    private BigDecimal minUnitPrice;

    private BigDecimal maxUnitPrice;

    private String supplier;

    private String warehouseLocation;

    private LocalDateTime createStartTime;

    private LocalDateTime createEndTime;

    private Integer current = 1;

    private Integer size = 10;

    private String orderBy = "createTime";

    private String orderType = "desc";

}
