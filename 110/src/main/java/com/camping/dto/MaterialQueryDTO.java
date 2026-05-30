package com.camping.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MaterialQueryDTO {

    @NotNull(message = "页码不能为空")
    private Integer pageNum = 1;

    @NotNull(message = "每页条数不能为空")
    private Integer pageSize = 10;

    private String keyword;

    private Integer type;

    private Integer status;

    private String batchCode;

    private Long categoryId;
}
