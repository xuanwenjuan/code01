package com.amber.customize.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("amber_raw")
public class AmberRaw extends BaseEntity {

    private String traceCode;

    private String origin;

    private BigDecimal weight;

    private String clarity;

    private String inclusions;

    private Integer status;

    private Integer locked;

    private Long lockOrderId;

    private LocalDate storageDate;

    private String remark;

}