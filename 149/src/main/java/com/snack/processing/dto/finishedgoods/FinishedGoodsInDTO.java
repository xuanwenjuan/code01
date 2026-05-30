package com.snack.processing.dto.finishedgoods;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FinishedGoodsInDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotBlank(message = "产品名称不能为空")
    private String productName;

    @NotNull(message = "入库数量不能为空")
    private BigDecimal quantity;

    @NotBlank(message = "单位不能为空")
    private String unit;

    @NotNull(message = "单位成本不能为空")
    private BigDecimal unitCost;

    private LocalDate productionDate;

    private LocalDate expireDate;

    @Length(max = 50, message = "仓库长度不能超过50")
    private String warehouse;

    @Length(max = 50, message = "库位长度不能超过50")
    private String location;

    @Length(max = 500, message = "备注长度不能超过500")
    private String remark;
}
