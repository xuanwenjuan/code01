package com.incense.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material_ledger")
public class MaterialLedger {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String ledgerNo;
    private String ledgerType;
    private Long materialId;
    private String materialName;
    private String batchCode;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private String relatedOrderNo;
    private Long operatorId;
    private String operatorName;
    private String remark;
    private LocalDateTime createTime;
    @TableLogic
    private Integer deleted;
}
