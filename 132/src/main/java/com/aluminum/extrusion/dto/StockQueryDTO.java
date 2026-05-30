package com.aluminum.extrusion.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class StockQueryDTO {

    @Min(value = 1, message = "页码最小为1")
    private Integer current = 1;

    @Min(value = 1, message = "每页条数最小为1")
    private Integer size = 10;

    private Integer materialType;

    private Integer stockStatus;

    private String alloyGrade;

    private String specification;

    private String batchNo;

    private String storageLocation;
}
