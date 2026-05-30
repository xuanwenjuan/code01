package com.mining.maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EquipmentCategoryDTO {

    private Long id;

    private Long parentId;

    @NotBlank(message = "类目名称不能为空")
    private String categoryName;

    @NotBlank(message = "类目编码不能为空")
    private String categoryCode;

    private String categoryType;

    private Integer sortOrder;

    @NotNull(message = "状态不能为空")
    private Integer status;

    private String miningArea;

    private String description;
}