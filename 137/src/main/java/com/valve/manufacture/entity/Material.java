package com.valve.manufacture.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.valve.manufacture.common.BaseEntity;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {

    @NotBlank(message = "原料编码不能为空")
    private String materialCode;

    @NotBlank(message = "原料名称不能为空")
    private String materialName;

    @NotBlank(message = "原料类型不能为空")
    private String materialType;

    private String material;

    private String specification;

    private String unit;

    private BigDecimal totalQuantity;

    private BigDecimal warningQuantity;

    private Integer status;

    private Integer isRustProne;

    private Integer rustRemindDays;

    private LocalDate lastRustCheck;

    private String remark;
}
