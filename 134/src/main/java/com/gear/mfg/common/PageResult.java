package com.gear.mfg.common;

import lombok.Data;

import java.util.List;

@Data
public class PageResult<T> {

    private Long total;

    private Long pageNum;

    private Long pageSize;

    private List<T> list;

    public PageResult() {
    }

    public PageResult(Long total, Long pageNum, Long pageSize, List<T> list) {
        this.total = total;
        this.pageNum = pageNum;
        this.pageSize = pageSize;
        this.list = list;
    }
}
