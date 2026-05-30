package com.cosmetics.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("finished_in_out_log")
public class FinishedInOutLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long finishedProductId;

    private Integer type;

    private BigDecimal quantity;

    private BigDecimal beforeQuantity;

    private BigDecimal afterQuantity;

    private String orderNo;

    private Long operatorId;

    private String operatorName;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
