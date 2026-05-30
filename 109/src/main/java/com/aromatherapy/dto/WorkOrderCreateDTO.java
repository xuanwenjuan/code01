package com.aromatherapy.dto;

import com.aromatherapy.validation.ValidPositiveNumber;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class WorkOrderCreateDTO {

    @NotBlank(message = "客户名称不能为空")
    @Size(max = 100, message = "客户名称长度不能超过100")
    private String customerName;

    @NotBlank(message = "香型名称不能为空")
    @Size(max = 50, message = "香型名称长度不能超过50")
    private String aromaName;

    private Long categoryId;

    @NotNull(message = "目标产量不能为空")
    @ValidPositiveNumber(message = "目标产量必须大于0")
    private BigDecimal targetQuantity;

    @NotEmpty(message = "配方明细不能为空")
    @Valid
    private List<FormulaItemDTO> formulaList;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
