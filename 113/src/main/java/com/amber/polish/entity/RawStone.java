package com.amber.polish.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("amber_raw_stone")
public class RawStone extends BaseEntity {

    private String traceCode;

    private Long categoryId;

    private String origin;

    private BigDecimal weight;

    private BigDecimal length;

    private BigDecimal width;

    private BigDecimal height;

    private String inclusionSpecies;

    private String clarity;

    private BigDecimal purchasePrice;

    private Long purchaserId;

    private String status;

    private LocalDateTime inspectionTime;

    private String remark;
}
