package com.aluminum.extrusion.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CostReportQueryDTO {

    @NotNull(message = "年份不能为空")
    @Min(value = 2020, message = "年份不能小于2020")
    @Max(value = 2100, message = "年份不能大于2100")
    private Integer year;

    @NotNull(message = "月份不能为空")
    @Min(value = 1, message = "月份不能小于1")
    @Max(value = 12, message = "月份不能大于12")
    private Integer month;

    private Long categoryId;

    private String orderNo;

    @Min(value = 1, message = "页码最小为1")
    private Integer current = 1;

    @Min(value = 1, message = "每页条数最小为1")
    private Integer size = 10;
}
