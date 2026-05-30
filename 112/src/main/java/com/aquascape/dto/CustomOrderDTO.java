package com.aquascape.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CustomOrderDTO {
    private Long id;

    @NotBlank(message = "客户姓名不能为空")
    @Size(max = 50, message = "客户姓名长度不能超过50")
    private String customerName;

    @NotBlank(message = "客户电话不能为空")
    @Size(max = 20, message = "客户电话长度不能超过20")
    private String customerPhone;

    @Size(max = 255, message = "客户地址长度不能超过255")
    private String customerAddress;

    private Long scaperId;

    @Size(max = 50, message = "缸体尺寸长度不能超过50")
    private String tankSize;

    @Size(max = 2000, message = "设计方案长度不能超过2000")
    private String designScheme;

    @NotNull(message = "总价不能为空")
    @Positive(message = "总价必须大于0")
    private BigDecimal totalPrice;

    private BigDecimal laborCost;

    private BigDecimal deposit;

    private Integer orderStatus;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;

    @Valid
    private List<OrderMaterialDTO> orderMaterials;
}
