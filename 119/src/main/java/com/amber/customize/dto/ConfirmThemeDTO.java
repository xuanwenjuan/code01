package com.amber.customize.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConfirmThemeDTO {

    @NotBlank(message = "题材描述不能为空")
    private String themeDescription;

    private String drawingUrl;

}
