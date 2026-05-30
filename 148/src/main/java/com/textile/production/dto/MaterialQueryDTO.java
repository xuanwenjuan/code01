package com.textile.production.dto;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class MaterialQueryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String type;
    private String status;
    private String keyword;
    private Integer moistureProof;
    private BigDecimal minQuantity;
    private BigDecimal maxQuantity;
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String orderBy;
    private String orderDir;
}
