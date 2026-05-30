package com.logistics.bigcargo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class InventoryDTO {
    private Long id;

    @NotBlank(message = "货品名称不能为空")
    private String goodsName;

    @NotNull(message = "货物品类ID不能为空")
    private Long categoryId;

    private String specification;

    private BigDecimal weight;

    private BigDecimal volume;

    private Integer bearingLevel;

    private String storageZone;

    private String protectionMaterial;

    @NotNull(message = "数量不能为空")
    private Integer quantity;

    private Integer stockStatus = 1;

    private Integer fragileFlag = 0;

    private LocalDateTime protectionExpireTime;

    private String remark;
}
