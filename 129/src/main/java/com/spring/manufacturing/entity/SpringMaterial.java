package com.spring.manufacturing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("spring_material")
public class SpringMaterial extends BaseEntity {

    @NotBlank(message = "原料名称不能为空")
    @Size(max = 100, message = "原料名称长度不能超过100个字符")
    private String materialName;

    @NotBlank(message = "原料牌号不能为空")
    @Size(max = 50, message = "原料牌号长度不能超过50个字符")
    private String materialBrand;

    private String materialCode;

    @NotBlank(message = "原料类型不能为空")
    private String materialType;

    @Size(max = 200, message = "规格型号长度不能超过200个字符")
    private String specification;

    private String batchNo;

    @NotNull(message = "库存数量不能为空")
    @PositiveOrZero(message = "库存数量不能为负数")
    private BigDecimal quantity;

    @NotNull(message = "锁定库存不能为空")
    @PositiveOrZero(message = "锁定库存不能为负数")
    private BigDecimal lockedQuantity = BigDecimal.ZERO;

    @NotNull(message = "可用库存不能为空")
    @PositiveOrZero(message = "可用库存不能为负数")
    private BigDecimal availableQuantity;

    private String unit;

    private BigDecimal warningQuantity;

    private String status;

    private Integer isHighToughness;

    private String moistureProtectRemind;

    @Size(max = 200, message = "供应商长度不能超过200个字符")
    private String supplier;

    private LocalDate incomingDate;

    private LocalDate expireDate;

    private BigDecimal unitPrice;

    private String remark;

    private Long inboundOperatorId;

    private LocalDateTime inboundTime;
}