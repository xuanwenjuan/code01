package com.snacktrace.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class MaterialQueryDTO {
    private String materialName;
    private Integer materialType;
    private Integer status;
    private String supplier;
    private String origin;

    @Min(value = 1, message = "页码最小为1")
    private Integer page = 1;

    @Min(value = 1, message = "每页条数最小为1")
    private Integer size = 10;
}
