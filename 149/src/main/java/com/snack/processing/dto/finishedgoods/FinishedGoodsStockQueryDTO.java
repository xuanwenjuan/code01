package com.snack.processing.dto.finishedgoods;

import com.snack.processing.common.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
public class FinishedGoodsStockQueryDTO extends PageQuery {
    private Long workOrderId;
    private String workOrderNo;
    private Long snackCategoryId;
    private String productName;
    private String batchNo;
    private Integer stockStatus;
    private LocalDate expireDateStart;
    private LocalDate expireDateEnd;
}
