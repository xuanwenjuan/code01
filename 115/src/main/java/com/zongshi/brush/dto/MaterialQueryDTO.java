package com.zongshi.brush.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class MaterialQueryDTO {
    private String materialName;

    private String materialCode;

    @Min(value = 1, message = "原料类型最小值为1")
    @Max(value = 4, message = "原料类型最大值为4")
    private Integer materialType;

    private String grade;

    private Integer status;

    private Integer isMoistureSensitive;

    private Long categoryId;

    @Min(value = 1, message = "页码最小值为1")
    private Integer pageNum = 1;

    @Min(value = 1, message = "每页条数最小值为1")
    @Max(value = 100, message = "每页条数最大值为100")
    private Integer pageSize = 10;
}
