package com.foundry.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_inbound")
public class MaterialInbound extends BaseEntity {

    @NotBlank(message = "入库单号不能为空")
    private String inboundNo;

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    private String materialName;

    private String materialType;

    private String batchNo;

    @NotNull(message = "入库数量不能为空")
    @Positive(message = "入库数量必须大于0")
    private BigDecimal quantity;

    private String unit;

    @NotNull(message = "单价不能为空")
    @Positive(message = "单价必须大于0")
    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    private String supplier;

    private LocalDate productionDate;

    private Integer qualityDays;

    private String status;

    private String remark;
}
