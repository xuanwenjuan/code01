package com.evparts.common;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.metadata.OrderItem;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.Data;

import java.util.List;

@Data
public class PageQuery {

    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String orderBy;
    private String orderType = "desc";

    public <T> IPage<T> toPage() {
        Page<T> page = new Page<>(pageNum, pageSize);
        if (orderBy != null && !orderBy.isEmpty()) {
            if ("asc".equalsIgnoreCase(orderType)) {
                page.addOrder(OrderItem.asc(orderBy));
            } else {
                page.addOrder(OrderItem.desc(orderBy));
            }
        }
        return page;
    }

    public <T> IPage<T> toPage(List<OrderItem> orderItems) {
        Page<T> page = new Page<>(pageNum, pageSize);
        if (orderItems != null && !orderItems.isEmpty()) {
            page.addOrder(orderItems);
        }
        return page;
    }

}
