package com.instrument.consignment.po;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("profit_share")
public class ProfitSharePO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String shareNo;

    private Long archiveId;

    private String traceNo;

    private Long workOrderId;

    private Long categoryId;

    private String receiveChannel;

    private BigDecimal salePrice;

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal platformCommissionRate;

    private BigDecimal platformCommission;

    private BigDecimal otherCost;

    private BigDecimal totalCost;

    private BigDecimal sellerProfit;

    private String status;

    private LocalDateTime settleTime;

    private Long operatorId;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer isDeleted;
}
