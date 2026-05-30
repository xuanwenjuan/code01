package com.logistics.bigcargo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CategoryDTO {
    private Long id;

    @NotBlank(message = "品类名称不能为空")
    private String name;

    @NotBlank(message = "品类编码不能为空")
    private String code;

    private Long parentId = 0L;

    @NotNull(message = "层级不能为空")
    private Integer level;

    private Integer sort = 0;

    private Integer priority = 0;

    private Integer status = 1;

    private String remark;
}
