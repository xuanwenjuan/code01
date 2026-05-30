package com.textile.production.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("raw_material_batch")
public class RawMaterialBatch implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private String batchCode;

    private Long materialId;

    private java.math.BigDecimal quantity;

    private java.math.BigDecimal unitPrice;

    private String supplier;

    private LocalDate productionDate;

    private LocalDate expiryDate;

    private String warehouseArea;

    private java.math.BigDecimal humidity;

    private Integer moistureWarning;

    private Integer status;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
