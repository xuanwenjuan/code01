package com.ancientpaper.dto;

import com.ancientpaper.validation.CreateGroup;
import com.ancientpaper.validation.UpdateGroup;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryDTO {

    @NotNull(message = "分类ID不能为空", groups = UpdateGroup.class)
    @Positive(message = "分类ID必须大于0", groups = UpdateGroup.class)
    private Long id;

    @Positive(message = "父分类ID必须大于0")
    private Long parentId = 0L;

    @NotBlank(message = "分类名称不能为空", groups = CreateGroup.class)
    @Size(max = 50, message = "分类名称长度不能超过50字符", groups = {CreateGroup.class, UpdateGroup.class})
    private String categoryName;

    @NotBlank(message = "分类编码不能为空", groups = CreateGroup.class)
    @Size(max = 50, message = "分类编码长度不能超过50字符", groups = {CreateGroup.class, UpdateGroup.class})
    private String categoryCode;

    @Positive(message = "排序值必须大于0")
    private Integer sortOrder = 0;

    @NotNull(message = "状态不能为空", groups = CreateGroup.class)
    private Integer status;
}
