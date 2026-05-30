package com.hardware.stamping.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_inventory")
public class MaterialInventory extends BaseEntity {

    @Size(max = 100, message = "批次编码长度不能超过100")
    private String batchCode;

    @NotBlank(message = "材质类型不能为空")
    @Size(max = 50, message = "材质类型长度不能超过50")
    private String materialType;

    @NotBlank(message = "规格型号不能为空")
    @Size(max = 100, message = "规格型号长度不能超过100")
    private String specification;

    @NotNull(message = "厚度不能为空")
    @DecimalMin(value = "0", message = "厚度不能小于0", inclusive = false)
    private BigDecimal thickness;

    @NotNull(message = "数量不能为空")
    @DecimalMin(value = "0", message = "数量不能小于0", inclusive = false)
    private BigDecimal quantity;

    @Size(max = 20, message = "单位长度不能超过20")
    private String unit;

    @DecimalMin(value = "0", message = "单价不能小于0")
    private BigDecimal unitPrice;

    @DecimalMin(value = "0", message = "总价不能小于0")
    private BigDecimal totalPrice;

    @NotNull(message = "库存状态不能为空")
    @Min(value = 0, message = "库存状态值不正确")
    @Max(value = 3, message = "库存状态值不正确")
    private Integer stockStatus;

    @NotNull(message = "是否易氧化不能为空")
    @Min(value = 0, message = "是否易氧化值不正确")
    @Max(value = 1, message = "是否易氧化值不正确")
    private Integer isOxidizable;

    private Integer storageDays;

    private LocalDate productionDate;

    private LocalDate expirationDate;

    @Size(max = 100, message = "供应商长度不能超过100")
    private String supplier;

    @Size(max = 100, message = "仓库位置长度不能超过100")
    private String warehouseLocation;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
