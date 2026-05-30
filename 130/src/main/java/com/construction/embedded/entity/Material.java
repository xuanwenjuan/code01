package com.construction.embedded.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("material")
public class Material {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String batchCode;

    private String materialName;

    private String materialType;

    private String specification;

    private String unit;

    private BigDecimal quantity;

    private BigDecimal lockedQuantity;

    private BigDecimal warningQuantity;

    private BigDecimal unitPrice;

    private String storageLocation;

    private Integer isHumidEnv;

    private Integer rustWarningDays;

    private LocalDate inDate;

    private String status;

    private Integer rustWarningStatus;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
