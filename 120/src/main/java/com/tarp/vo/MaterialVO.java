package com.tarp.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MaterialVO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String materialCode;
    private String materialName;
    private String materialType;
    private String specification;
    private String origin;
    private String batchNo;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal stockQuantity;
    private BigDecimal warningQuantity;
    private Integer status;
    private String statusName;
    private Integer isOil;
    private LocalDateTime expireTime;
    private LocalDateTime createTime;
}
