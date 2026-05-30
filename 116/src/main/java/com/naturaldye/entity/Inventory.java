package com.naturaldye.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.naturaldye.enums.InventoryStatusEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("inventory")
public class Inventory extends BaseEntity {

    @NotBlank(message = "物料名称不能为空")
    private String materialName;

    private Integer materialType;

    private String batchNo;

    private String origin;

    private BigDecimal weight;

    private BigDecimal unitPrice;

    private BigDecimal quantity;

    private BigDecimal warningQuantity;

    private BigDecimal lockedQuantity;

    private InventoryStatusEnum status;

    private LocalDate expiryDate;

    private Boolean isFading;

    private String unit;

    private String remarks;
}
