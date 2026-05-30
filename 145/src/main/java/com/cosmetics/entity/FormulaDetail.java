package com.cosmetics.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("formula_detail")
public class FormulaDetail {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long formulaId;

    private Long materialId;

    private BigDecimal dosage;

    private String dosageUnit;

    private Integer sortOrder;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
