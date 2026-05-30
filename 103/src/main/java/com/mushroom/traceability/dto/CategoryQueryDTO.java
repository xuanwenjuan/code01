package com.mushroom.traceability.dto;

import lombok.Data;

@Data
public class CategoryQueryDTO {
    private String categoryName;
    private String categoryType;
    private Integer status;
    private Integer isForbidden;
    private Integer isWild;
    private Integer pageNum = 1;
    private Integer pageSize = 10;
}