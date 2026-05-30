package com.motor.core.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CoreCategoryVO {
    private Long id;
    private Long parentId;
    private String categoryName;
    private String categoryCode;
    private String categoryType;
    private Integer sortOrder;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private List<CoreCategoryVO> children;
}
