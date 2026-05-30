package com.fitness.manufacture.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.dto.MaterialBatchQueryDTO;
import com.fitness.manufacture.entity.MaterialBatch;

import java.math.BigDecimal;
import java.util.List;

public interface MaterialBatchService extends IService<MaterialBatch> {

    IPage<MaterialBatch> getBatchPage(PageQuery query, Long materialId, Integer status);

    IPage<MaterialBatch> getBatchPageByConditions(MaterialBatchQueryDTO queryDTO);

    List<MaterialBatch> getAvailableBatches(Long materialId);

    String generateBatchNo();

    void checkExpiryWarning();

    void updateQuantity(Long batchId, BigDecimal quantity, int type);
}
