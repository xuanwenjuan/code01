package com.gearbox.manage.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {
    private String materialCode;
    private String materialName;
    private String materialType;
    private String specification;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal quantity;
    private BigDecimal warningQuantity;
    private String status;
    private Integer isEasyOxidize;
    private Integer rustproofDays;
    private String supplier;

    @TableField(exist = false)
    private List<MaterialBatch> batches;
}
