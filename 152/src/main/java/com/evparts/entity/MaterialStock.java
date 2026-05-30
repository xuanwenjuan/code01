package com.evparts.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("material_stock")
public class MaterialStock {

    private Long id;
    private Long materialId;
    private String batchNo;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private String warehouse;
    private LocalDate inboundDate;
    private LocalDate expiryDate;
    private Integer stockStatus;
    private LocalDateTime moistureCheckTime;
    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;

    @TableField(exist = false)
    private String materialName;

    @TableField(exist = false)
    private String materialCode;

    @TableField(exist = false)
    private String specification;

    @TableField(exist = false)
    private String unit;

    @TableField(exist = false)
    private Integer moistureProof;

}
