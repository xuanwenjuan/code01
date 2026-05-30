package com.snack.processing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("stock_check_detail")
public class StockCheckDetail extends BaseEntity {

    private Long checkId;
    private Long materialId;
    private String materialName;
    private String materialCode;
    private String batchNo;
    private BigDecimal systemQuantity;
    private BigDecimal actualQuantity;
    private BigDecimal differenceQuantity;
    private BigDecimal unitPrice;
    private BigDecimal differenceAmount;
    private String reason;
    private String remark;
}
