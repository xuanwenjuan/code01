package com.fishing.distribution.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SortingOrderDTO {

    @NotNull(message = "渔船ID不能为空")
    @Min(value = 1, message = "渔船ID不合法")
    private Long boatId;

    private LocalDateTime arrivalTime;

    @Size(max = 500, message = "备注长度不能超过500字符")
    private String remark;

    @Valid
    @NotEmpty(message = "分拣明细不能为空")
    @Size(max = 100, message = "分拣明细不能超过100条")
    private List<SortingOrderDetailDTO> details;
}

@Data
class SortingOrderDetailDTO {

    @NotNull(message = "类目ID不能为空")
    @Min(value = 1, message = "类目ID不合法")
    private Long categoryId;

    private String categoryName;

    @Size(max = 50, message = "品级长度不能超过50字符")
    private String grade;

    @Size(max = 50, message = "鲜活度等级长度不能超过50字符")
    private String freshnessLevel;

    @NotNull(message = "重量不能为空")
    @DecimalMin(value = "0.01", message = "重量必须大于0")
    @DecimalMax(value = "99999.99", message = "重量超出范围")
    private BigDecimal weight;

    @DecimalMin(value = "0", message = "单价不能为负")
    private BigDecimal unitPrice;

    @Size(max = 100, message = "存放位置长度不能超过100字符")
    private String location;
}
