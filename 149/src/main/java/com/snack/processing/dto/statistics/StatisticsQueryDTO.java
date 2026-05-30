package com.snack.processing.dto.statistics;

import com.snack.processing.common.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
public class StatisticsQueryDTO extends PageQuery {

    private LocalDate statisticsDateStart;
    private LocalDate statisticsDateEnd;
    private Integer statisticsType;
}
