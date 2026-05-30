package com.fishing.distribution.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sorting_loss_record")
public class SortingLossRecord extends BaseEntity {

    private Long orderId;

    private String orderNo;

    private Long categoryId;

    private String categoryName;

    private String lossType;

    private BigDecimal lossWeight;

    private BigDecimal lossAmount;

    private String lossReason;

    private Long recordBy;

    private String recordByName;

    private String remark;
}
