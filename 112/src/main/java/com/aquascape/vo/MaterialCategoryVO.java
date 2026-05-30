package com.aquascape.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class MaterialCategoryVO {
    private Long id;
    private String categoryName;
    private Long parentId;
    private Integer level;
    private Integer sort;
    private Integer status;
    private String icon;
    private String description;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private List<MaterialCategoryVO> children;
}
