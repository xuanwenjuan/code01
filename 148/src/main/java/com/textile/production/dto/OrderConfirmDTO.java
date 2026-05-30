package com.textile.production.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class OrderConfirmDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    private String processRemark;

    @NotEmpty(message = "用料清单不能为空")
    private List<OrderMaterialDTO> materials;
}
