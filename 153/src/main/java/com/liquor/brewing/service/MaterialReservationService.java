package com.liquor.brewing.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.liquor.brewing.entity.MaterialReservation;

import java.math.BigDecimal;
import java.util.List;

public interface MaterialReservationService extends IService<MaterialReservation> {

    BigDecimal getReservedQuantity(Long materialId);

    void reserveMaterial(Long workOrderId, Long materialId, Long batchId, BigDecimal quantity, String remark);

    void releaseReservation(Long workOrderId, Long materialId);

    void confirmReservation(Long workOrderId, Long materialId);

    List<MaterialReservation> getByWorkOrderId(Long workOrderId);

    void expireReservations();
}
