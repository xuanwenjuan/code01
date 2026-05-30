package com.bearing.production.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class MaterialQueryDTO {

    private String materialName;

    private String specification;

    private String materialType;

    @Pattern(regexp = "^[A-Za-z0-9]*$", message = "供应商名称格式不正确")
    private String supplier;

    private Integer stockStatus;

    private Integer rustProof;

    @Min(value = 1, message = "页码必须大于0")
    private Integer pageNum = 1;

    @Min(value = 1, message = "每页条数必须大于0")
    private Integer pageSize = 10;
}
