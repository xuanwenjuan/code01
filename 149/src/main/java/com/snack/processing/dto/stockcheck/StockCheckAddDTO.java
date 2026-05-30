package com.snack.processing.dto.stockcheck;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;
import java.util.List;

@Data
public class StockCheckAddDTO {

    @NotBlank(message = "盘点单号不能为空")
    private String checkNo;

    @Length(max = 50, message = "仓库长度不能超过50")
    private String warehouse;

    @NotNull(message = "盘点日期不能为空")
    private LocalDate checkDate;

    @NotNull(message = "盘点类型不能为空")
    private Integer checkType;

    @Length(max = 500, message = "备注长度不能超过500")
    private String remark;

    private List<StockCheckDetailDTO> details;
}
