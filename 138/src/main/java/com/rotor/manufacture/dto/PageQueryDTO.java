package com.rotor.manufacture.dto;

import lombok.Data;

@Data
public class PageQueryDTO {
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String keyword;
    private Integer status;
    private String materialType;
    private Long categoryId;
}