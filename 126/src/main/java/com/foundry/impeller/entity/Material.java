package com.foundry.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {

    @NotBlank(message = "批次编号不能为空")
    private String batchNo;

    @NotBlank(message = "物料名称不能为空")
    private String materialName;

    @NotBlank(message = "物料类型不能为空")
    private String materialType;

    private String specification;

    @NotBlank(message = "计量单位不能为空")
    private String unit;

    @NotNull(message = "库存数量不能为空")
    @PositiveOrZero(message = "库存数量不能为负数")
    private BigDecimal quantity;

    @NotNull(message = "预警数量不能为空")
    @PositiveOrZero(message = "预警数量不能为负数")
    private BigDecimal warningQuantity;

    private String status;

    private Integer isEasyClumping;

    @PositiveOrZero(message = "存放天数不能为负数")
    private Integer storageDays;

    private LocalDate productionDate;

    private String supplier;

    @NotNull(message = "单价不能为空")
    @PositiveOrZero(message = "单价不能为负数")
    private BigDecimal unitPrice;

    @PositiveOrZero(message = "锁定数量不能为负数")
    private BigDecimal lockQuantity;

    private String remark;
}
