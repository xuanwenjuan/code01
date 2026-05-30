package com.liquor.brewing.common;

import com.baomidou.mybatisplus.core.metadata.IPage;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class PageResult<T> implements Serializable {

    private List<T> list;
    private Long total;
    private Integer pageNum;
    private Integer pageSize;
    private Integer pages;

    public PageResult() {
    }

    public PageResult(IPage<T> page) {
        this.list = page.getRecords();
        this.total = page.getTotal();
        this.pageNum = (int) page.getCurrent();
        this.pageSize = (int) page.getSize();
        this.pages = (int) page.getPages();
    }

    public static <T> PageResult<T> of(IPage<T> page) {
        return new PageResult<>(page);
    }
}
