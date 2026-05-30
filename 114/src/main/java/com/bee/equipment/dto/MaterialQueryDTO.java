package com.bee.equipment.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialQueryDTO {

    @Min(value = 1, message = "页码不能小于1")
    private Integer pageNum = 1;

    @Min(value = 1, message = "每页数量不能小于1")
    private Integer pageSize = 10;

    private String name;

    private Long categoryId;

    private String status;

    private String origin;

    private BigDecimal minQuantity;

    private BigDecimal maxQuantity;

    private LocalDate expiryDateStart;

    private LocalDate expiryDateEnd;

    private String sortField = "createTime";

    private String sortOrder = "desc";
}
