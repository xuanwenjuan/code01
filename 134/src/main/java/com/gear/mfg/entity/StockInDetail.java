package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("stock_in_detail")
public class StockInDetail extends BaseEntity {

    private Long inId;

    private String inNo;

    private Long materialId;

    private String materialName;

    private String materialCode;

    private String materialSpec;

    private String batchNo;

    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private BigDecimal amount;

    private String unit;

    private String location;

    private String remark;
}
