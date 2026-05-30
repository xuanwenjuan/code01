package com.cosmetics.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.common.PageQuery;
import com.cosmetics.entity.FinishedProduct;
import com.cosmetics.entity.FinishedInOutLog;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface FinishedProductService {

    Page<FinishedProduct> getPage(PageQuery pageQuery, Long productId, Integer status);

    FinishedProduct getById(Long id);

    void warehouseIn(FinishedProduct finishedProduct);

    void warehouseOut(Long id, BigDecimal quantity, String orderNo, String remark);

    BigDecimal getTotalStock(Long productId);

    Map<String, Object> getStockSummary();

    Page<FinishedInOutLog> getInOutLogPage(PageQuery pageQuery, Long finishedProductId, Integer type);

    List<FinishedProduct> getAvailableStock(Long productId);
}
