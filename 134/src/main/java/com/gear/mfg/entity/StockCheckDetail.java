package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("stock_check_detail")
public class StockCheckDetail extends BaseEntity {

    private Long checkId;

    private String checkNo;

    private Long materialId;

    private String materialName;

    private String materialCode;

    private String materialSpec;

    private String batchNo;

    private BigDecimal systemQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal diffQuantity;

    private String unit;

    private String location;

    private String diffReason;

    private String remark;
}
