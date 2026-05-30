package com.cosmetics.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.common.PageQuery;
import com.cosmetics.dto.MaterialOutDTO;
import com.cosmetics.entity.Material;
import com.cosmetics.entity.MaterialBatch;
import com.cosmetics.entity.MaterialInOutLog;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface MaterialBatchService {

    Page<MaterialBatch> getPage(PageQuery pageQuery, Long materialId, Integer isExpired);

    MaterialBatch getById(Long id);

    String generateBatchNo(Long materialId);

    void warehouseIn(MaterialBatch batch);

    void warehouseOut(MaterialOutDTO outDTO);

    void batchWarehouseOut(List<MaterialOutDTO> outDTOList);

    void updateExpiredStatus();

    List<MaterialBatch> getExpiringBatches(Integer days);

    BigDecimal getTotalStock(Long materialId);

    Map<String, Object> getStockSummary();

    Page<MaterialInOutLog> getInOutLogPage(PageQuery pageQuery, Long materialId, Integer type);

    List<MaterialBatch> getAvailableBatches(Long materialId);
}
