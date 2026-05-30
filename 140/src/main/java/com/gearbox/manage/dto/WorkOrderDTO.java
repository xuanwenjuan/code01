package com.gearbox.manage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class WorkOrderDTO {
    @NotBlank(message = "产品名称不能为空")
    private String productName;

    @NotBlank(message = "产品型号不能为空")
    private String productModel;

    @NotNull(message = "生产数量不能为空")
    @Positive(message = "生产数量必须大于0")
    private Integer quantity;

    private Long categoryId;

    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private String priority = "NORMAL";

    private List<WorkOrderMaterialDTO> materials;

    private String remark;
}
