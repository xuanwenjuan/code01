package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("stock_transfer_detail")
public class StockTransferDetail extends BaseEntity {

    private Long transferId;

    private String transferNo;

    private Long materialId;

    private String materialName;

    private String materialCode;

    private String materialSpec;

    private String batchNo;

    private BigDecimal quantity;

    private String unit;

    private String fromLocation;

    private String toLocation;

    private String remark;
}
