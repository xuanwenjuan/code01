package com.spring.manufacturing.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class MaterialQueryDTO {

    private String materialBrand;

    private String materialType;

    private String status;

    private String supplier;

    @Min(value = 1, message = "页码最小为1")
    private Integer pageNum = 1;

    @Min(value = 1, message = "每页条数最小为1")
    private Integer pageSize = 10;
}