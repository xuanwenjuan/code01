package com.snack.processing.common;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.Data;

import java.io.Serializable;

@Data
public class PageQuery implements Serializable {

    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String orderBy;
    private String orderType = "desc";

    public <T> IPage<T> buildPage() {
        return new Page<>(pageNum, pageSize);
    }
}
