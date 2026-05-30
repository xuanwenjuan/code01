package com.hydraulic.piston.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "活塞产品分类DTO")
public class PistonCategoryDTO {

    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "分类名称", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "分类名称不能为空")
    @Size(max = 100, message = "分类名称长度不能超过100个字符")
    private String categoryName;

    @Schema(description = "分类编码")
    @Size(max = 50, message = "分类编码长度不能超过50个字符")
    private String categoryCode;

    @Schema(description = "父分类ID")
    private Long parentId;

    @Schema(description = "排序")
    private Integer sort;

    @Schema(description = "排产优先级")
    private Integer priority;

    @Schema(description = "状态 0-下线 1-启用")
    private Integer status;

    @Schema(description = "描述")
    @Size(max = 500, message = "描述长度不能超过500个字符")
    private String description;
}
