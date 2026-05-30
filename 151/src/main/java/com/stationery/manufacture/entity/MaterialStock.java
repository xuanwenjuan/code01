package com.stationery.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material_stock")
public class MaterialStock {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String materialCode;

    private String materialName;

    private String materialType;

    private String batchNo;

    private String specification;

    private String unit;

    private BigDecimal quantity;

    private BigDecimal warningQuantity;

    private BigDecimal unitPrice;

    private Integer stockStatus;

    private Integer purchaseStatus;

    private Integer moistureProof;

    private String storageLocation;

    private LocalDateTime productionDate;

    private LocalDateTime expireDate;

    private String supplier;

    private String remark;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
