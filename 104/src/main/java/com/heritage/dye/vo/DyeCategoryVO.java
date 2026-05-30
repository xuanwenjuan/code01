package com.heritage.dye.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DyeCategoryVO {
    private Long id;
    private String categoryCode;
    private String categoryName;
    private Long parentId;
    private Integer categoryLevel;
    private Integer categoryType;
    private String formula;
    private String description;
    private BigDecimal sortOrder;
    private Integer status;
    private LocalDateTime createTime;
    private List<DyeCategoryVO> children;
}
