package com.aromatherapy.entity.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("raw_material")
public class RawMaterialPO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String batchCode;

    private String materialName;

    private String origin;

    private String extractionProcess;

    private BigDecimal purity;

    private Integer shelfLife;

    private LocalDate productionDate;

    private LocalDate expiryDate;

    private BigDecimal stockQuantity;

    private BigDecimal warningQuantity;

    private String unit;

    private BigDecimal unitPrice;

    private Integer stockStatus;

    private Integer status;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private Integer deleted;
}
