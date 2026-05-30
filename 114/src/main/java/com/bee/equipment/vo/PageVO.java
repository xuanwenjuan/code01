package com.bee.equipment.vo;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class PageVO<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long total;

    private Long pageNum;

    private Long pageSize;

    private Long pages;

    private List<T> list;

    public PageVO() {
    }

    public PageVO(Long total, Long pageNum, Long pageSize, List<T> list) {
        this.total = total;
        this.pageNum = pageNum;
        this.pageSize = pageSize;
        this.list = list;
        this.pages = (total + pageSize - 1) / pageSize;
    }
}
