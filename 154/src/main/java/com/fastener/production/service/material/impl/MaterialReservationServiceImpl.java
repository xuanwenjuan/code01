package com.fastener.production.service.material.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.common.exception.BusinessException;
import com.fastener.production.common.result.ResultCode;
import com.fastener.production.entity.material.MaterialBatch;
import com.fastener.production.entity.material.MaterialReservation;
import com.fastener.production.entity.workorder.ColdHeadingWorkOrder;
import com.fastener.production.mapper.material.MaterialReservationMapper;
import com.fastener.production.service.material.MaterialBatchService;
import com.fastener.production.service.material.MaterialReservationService;
import com.fastener.production.service.workorder.ColdHeadingWorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialReservationServiceImpl extends ServiceImpl<MaterialReservationMapper, MaterialReservation> implements MaterialReservationService {

    private final MaterialReservationMapper materialReservationMapper;
    private final MaterialBatchService materialBatchService;
    private final ColdHeadingWorkOrderService workOrderService;

    @Override
    public IPage<MaterialReservation> page(PageQuery pageQuery, Long workOrderId, Long materialId, Integer status) {
        Page<MaterialReservation> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        LambdaQueryWrapper<MaterialReservation> wrapper = new LambdaQueryWrapper<>();
        if (workOrderId != null) {
            wrapper.eq(MaterialReservation::getWorkOrderId, workOrderId);
        }
        if (materialId != null) {
            wrapper.eq(MaterialReservation::getMaterialId, materialId);
        }
        if (status != null) {
            wrapper.eq(MaterialReservation::getStatus, status);
        }
        wrapper.orderByDesc(MaterialReservation::getCreateTime);
        return this.page(page, wrapper);
    }

    @Override
    public List<MaterialReservation> listByWorkOrderId(Long workOrderId) {
        return this.list(new LambdaQueryWrapper<MaterialReservation>()
                .eq(MaterialReservation::getWorkOrderId, workOrderId)
                .orderByDesc(MaterialReservation::getCreateTime));
    }

    @Override
    public List<MaterialReservation> listActiveByMaterialId(Long materialId) {
        return this.list(new LambdaQueryWrapper<MaterialReservation>()
                .eq(MaterialReservation::getMaterialId, materialId)
                .eq(MaterialReservation::getStatus, 0)
                .orderByDesc(MaterialReservation::getCreateTime));
    }

    @Override
    public BigDecimal getTotalReservedQuantity(Long batchId) {
        List<MaterialReservation> reservations = this.list(new LambdaQueryWrapper<MaterialReservation>()
                .eq(MaterialReservation::getBatchId, batchId)
                .eq(MaterialReservation::getStatus, 0));
        return reservations.stream()
                .map(MaterialReservation::getReservedQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String createReservation(Long workOrderId, Long materialId, Long batchId, BigDecimal quantity) {
        ColdHeadingWorkOrder workOrder = workOrderService.getById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "工单不存在");
        }
        if (workOrder.getAuditStatus() == null || workOrder.getAuditStatus() != 1) {
            throw new BusinessException(ResultCode.OPERATION_NOT_ALLOWED, "工单未通过审核，无法预占原料");
        }

        MaterialBatch batch = materialBatchService.getById(batchId);
        if (batch == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "原料批次不存在");
        }
        if (!batch.getMaterialId().equals(materialId)) {
            throw new BusinessException(ResultCode.PARAM_ERROR, "批次与原料不匹配");
        }

        BigDecimal availableQty = batch.getAvailableQuantity();
        BigDecimal alreadyReserved = getTotalReservedQuantity(batchId);
        BigDecimal realAvailable = availableQty.subtract(alreadyReserved);
        if (realAvailable.compareTo(quantity) < 0) {
            throw new BusinessException(ResultCode.OPERATION_NOT_ALLOWED,
                    "库存不足，可用数量：" + realAvailable + "，申请预占：" + quantity);
        }

        String reservationNo = "RES" + System.currentTimeMillis();
        MaterialReservation reservation = new MaterialReservation();
        reservation.setReservationNo(reservationNo);
        reservation.setWorkOrderId(workOrderId);
        reservation.setOrderNo(workOrder.getOrderNo());
        reservation.setMaterialId(materialId);
        reservation.setMaterialName(batch.getMaterialName());
        reservation.setBatchId(batchId);
        reservation.setBatchNo(batch.getBatchCode());
        reservation.setReservedQuantity(quantity);
        reservation.setActualUsedQuantity(BigDecimal.ZERO);
        reservation.setStatus(0);
        reservation.setExpireTime(LocalDateTime.now().plusDays(7));
        this.save(reservation);

        batch.setReservedQuantity(alreadyReserved.add(quantity));
        batch.setReservedOrderCount(batch.getReservedOrderCount() + 1);
        materialBatchService.updateById(batch);

        workOrder.setMaterialReservedQuantity(quantity);
        workOrder.setMaterialReservedTime(LocalDateTime.now());
        workOrderService.updateById(workOrder);

        return reservationNo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void consumeReservation(Long workOrderId, BigDecimal usedQuantity) {
        List<MaterialReservation> reservations = this.list(new LambdaQueryWrapper<MaterialReservation>()
                .eq(MaterialReservation::getWorkOrderId, workOrderId)
                .eq(MaterialReservation::getStatus, 0));

        for (MaterialReservation reservation : reservations) {
            BigDecimal reserved = reservation.getReservedQuantity();
            BigDecimal actualUsed = reservation.getActualUsedQuantity();
            BigDecimal remaining = reserved.subtract(actualUsed);

            if (usedQuantity.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            BigDecimal consumeQty = usedQuantity.min(remaining);
            reservation.setActualUsedQuantity(actualUsed.add(consumeQty));

            if (reservation.getActualUsedQuantity().compareTo(reserved) >= 0) {
                reservation.setStatus(1);
            }
            this.updateById(reservation);

            MaterialBatch batch = materialBatchService.getById(reservation.getBatchId());
            BigDecimal batchRemaining = batch.getAvailableQuantity().subtract(consumeQty);
            batch.setAvailableQuantity(batchRemaining.max(BigDecimal.ZERO));
            batch.setReservedQuantity(batch.getReservedQuantity().subtract(consumeQty));
            if (reservation.getStatus() == 1) {
                batch.setReservedOrderCount(batch.getReservedOrderCount() - 1);
            }
            materialBatchService.updateById(batch);

            usedQuantity = usedQuantity.subtract(consumeQty);
        }

        if (usedQuantity.compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException(ResultCode.OPERATION_NOT_ALLOWED, "预占数量不足，请重新预占");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void releaseReservation(Long workOrderId) {
        List<MaterialReservation> reservations = this.list(new LambdaQueryWrapper<MaterialReservation>()
                .eq(MaterialReservation::getWorkOrderId, workOrderId)
                .eq(MaterialReservation::getStatus, 0));

        for (MaterialReservation reservation : reservations) {
            reservation.setStatus(2);
            this.updateById(reservation);

            MaterialBatch batch = materialBatchService.getById(reservation.getBatchId());
            BigDecimal remaining = reservation.getReservedQuantity().subtract(reservation.getActualUsedQuantity());
            if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal newReserved = batch.getReservedQuantity().subtract(remaining);
                batch.setReservedQuantity(newReserved.max(BigDecimal.ZERO));
                batch.setReservedOrderCount(batch.getReservedOrderCount() - 1);
                materialBatchService.updateById(batch);
            }
        }

        ColdHeadingWorkOrder workOrder = workOrderService.getById(workOrderId);
        if (workOrder != null) {
            workOrder.setMaterialReservedQuantity(BigDecimal.ZERO);
            workOrder.setMaterialReservedTime(null);
            workOrderService.updateById(workOrder);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void expireOverdueReservations() {
        List<MaterialReservation> overdue = this.list(new LambdaQueryWrapper<MaterialReservation>()
                .eq(MaterialReservation::getStatus, 0)
                .lt(MaterialReservation::getExpireTime, LocalDateTime.now()));

        for (MaterialReservation reservation : overdue) {
            releaseReservation(reservation.getWorkOrderId());
        }
    }
}
