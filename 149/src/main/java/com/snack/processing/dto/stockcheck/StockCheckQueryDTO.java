package com.snack.processing.dto.stockcheck;

import com.snack.processing.common.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
public class StockCheckQueryDTO extends PageQuery {
    private String checkNo;
    private String warehouse;
    private LocalDate checkDateStart;
    private LocalDate checkDateEnd;
    private Integer checkType;
    private Integer status;
}
