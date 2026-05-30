package com.construction.material.common;

import lombok.Data;

@Data
public class PageQuery {

    private Integer pageNum = 1;

    private Integer pageSize = 10;

    private String keyword;

    private String orderBy;

    private String orderType = "desc";
}
