package com.fan.impeller.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MaterialQueryDTO {
    @Size(max = 50, message = "原料名称长度不能超过50")
    private String materialName;

    @Size(max = 30, message = "原料类型长度不能超过30")
    private String materialType;

    @Size(max = 50, message = "批次号长度不能超过50")
    private String batchNo;

    private Integer stockStatus;

    private Integer status;

    private LocalDate startDate;

    private LocalDate endDate;
}
