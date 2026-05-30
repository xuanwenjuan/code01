package com.tarp.vo;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class PageVO<T> implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long total;
    private List<T> records;
    private Integer pageNum;
    private Integer pageSize;
    private Integer pages;

    public PageVO() {
    }

    public PageVO(Long total, List<T> records, Integer pageNum, Integer pageSize) {
        this.total = total;
        this.records = records;
        this.pageNum = pageNum;
        this.pageSize = pageSize;
        this.pages = (int) Math.ceil((double) total / pageSize);
    }
}
