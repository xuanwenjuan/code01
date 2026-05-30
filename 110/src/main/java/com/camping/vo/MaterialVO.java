package com.camping.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MaterialVO {

    private Long id;

    private String name;

    private Integer type;

    private String typeName;

    private String batchCode;

    private String spec;

    private String unit;

    private BigDecimal quantity;

    private BigDecimal warningQuantity;

    private Integer status;

    private String statusName;

    private LocalDate expiryDate;

    private String supplier;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
