package com.instrument.consignment.dto;

import com.instrument.consignment.validation.EnumValue;
import com.instrument.consignment.enums.ConditionLevelEnum;
import lombok.Data;

@Data
public class InstrumentArchiveQueryDTO {

    private Long categoryId;

    private String brand;

    private Integer productionYearStart;

    private Integer productionYearEnd;

    @EnumValue(enumClass = ConditionLevelEnum.class, allowNull = true)
    private String conditionLevel;

    private String status;

    private String traceNo;

    private Long sellerId;

    private Integer pageNum = 1;

    private Integer pageSize = 10;
}
