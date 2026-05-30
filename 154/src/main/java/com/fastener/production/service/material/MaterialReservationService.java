package com.fastener.production.service.material;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.entity.material.MaterialReservation;

import java.math.BigDecimal;
import java.util.List;

public interface MaterialReservationService extends IService<MaterialReservation> {

    IPage<MaterialReservation> page(PageQuery pageQuery, Long workOrderId, Long materialId, Integer status);

    List<MaterialReservation> listByWorkOrderId(Long workOrderId);

    List<MaterialReservation> listActiveByMaterialId(Long materialId);

    BigDecimal getTotalReservedQuantity(Long batchId);

    String createReservation(Long workOrderId, Long materialId, Long batchId, BigDecimal quantity);

    void consumeReservation(Long workOrderId, BigDecimal usedQuantity);

    void releaseReservation(Long workOrderId);

    void expireOverdueReservations();
}
