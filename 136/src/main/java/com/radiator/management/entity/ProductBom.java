package com.radiator.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("product_bom")
public class ProductBom {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long categoryId;

    private String bomCode;

    private String bomName;

    private Integer version;

    private BigDecimal standardLaborHours;

    private BigDecimal standardLaborCost;

    private BigDecimal standardEquipmentCost;

    private Integer status;

    private String remark;

    @TableField(exist = false)
    private List<ProductBomDetail> details;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}
