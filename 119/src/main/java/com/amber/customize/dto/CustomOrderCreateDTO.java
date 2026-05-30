package com.amber.customize.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CustomOrderCreateDTO {

    @NotNull(message = "原石ID不能为空")
    private Long rawId;

    @NotNull(message = "类目ID不能为空")
    private Long categoryId;

    @NotBlank(message = "客户姓名不能为空")
    private String customerName;

    @NotBlank(message = "客户电话不能为空")
    private String customerPhone;

    private String themeDescription;

    private String remark;

}
