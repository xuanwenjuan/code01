package com.camping.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {

    @NotBlank(message = "物料名称不能为空")
    private String name;

    private Integer type;

    private String batchCode;

    private String spec;

    private String unit;

    @NotNull(message = "库存数量不能为空")
    private BigDecimal quantity;

    private BigDecimal warningQuantity;

    private Integer status;

    private LocalDate expiryDate;

    private String supplier;

    private String remark;
}
