package com.liquor.brewing.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.liquor.brewing.common.BaseEntity;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {

    private String materialCode;

    @NotBlank(message = "物料名称不能为空")
    private String materialName;

    @NotNull(message = "物料类型不能为空")
    private Long typeId;

    private String specification;

    @NotBlank(message = "单位不能为空")
    private String unit;

    @DecimalMin(value = "0", message = "预警库存不能小于0")
    private BigDecimal warningStock;

    private Integer status;

    private Integer isFermented;

    private Integer shelfLifeDays;

    private String description;

    @TableField(exist = false)
    private String typeName;

    @TableField(exist = false)
    private String typeCode;

    @TableField(exist = false)
    private BigDecimal totalStock;
}
