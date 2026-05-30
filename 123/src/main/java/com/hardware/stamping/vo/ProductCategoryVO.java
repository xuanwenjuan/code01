package com.hardware.stamping.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductCategoryVO {
    private Long id;
    private String categoryName;
    private String categoryCode;
    private Long parentId;
    private Integer level;
    private Integer sort;
    private Integer priority;
    private Integer status;
    private String statusText;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private List<ProductCategoryVO> children;
}
