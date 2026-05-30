package com.logistics.bigcargo.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BatchStockStatusDTO {
    @NotEmpty(message = "库存ID列表不能为空")
    private List<Long> inventoryIds;

    @NotNull(message = "目标状态不能为空")
    private Integer targetStatus;

    private String batchRemark;
}
