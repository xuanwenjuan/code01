package com.amber.customize.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AmberRawVO {

    private Long id;

    private String traceCode;

    private String origin;

    private BigDecimal weight;

    private String clarity;

    private String inclusions;

    private Integer status;

    private String statusDesc;

    private LocalDate storageDate;

    private String remark;

    private LocalDateTime createTime;

}
