package com.liquor.brewing.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.liquor.brewing.common.Constants;
import com.liquor.brewing.entity.MaterialReservation;
import com.liquor.brewing.exception.BusinessException;
import com.liquor.brewing.mapper.MaterialBatchMapper;
import com.liquor.brewing.mapper.MaterialReservationMapper;
import com.liquor.brewing.service.MaterialReservationService;
import com.liquor.brewing.util.CodeGenerator;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaterialReservationServiceImpl extends ServiceImpl<MaterialReservationMapper, MaterialReservation> implements MaterialReservationService {

    @Resource
    private CodeGenerator codeGenerator;

    @Resource
    private MaterialBatchMapper materialBatchMapper;

    @Value("${liquor.reservation-expire-hours:24}")
    private Integer reservationExpireHours;

    @Override
    public BigDecimal getReservedQuantity(Long materialId) {
        return baseMapper.getReservedQuantity(materialId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reserveMaterial(Long workOrderId, Long materialId, Long batchId, BigDecimal quantity, String remark) {
        BigDecimal availableQuantity = materialBatchMapper.selectById(batchId).getQuantity();
        BigDecimal reservedQuantity = getReservedQuantity(materialId);
        if (availableQuantity.subtract(reservedQuantity).compareTo(quantity) < 0) {
            throw new BusinessException("物料可用库存不足");
        }

        MaterialReservation reservation = new MaterialReservation();
        reservation.setReservationNo(codeGenerator.generateBatchCode());
        reservation.setMaterialId(materialId);
        reservation.setBatchId(batchId);
        reservation.setWorkOrderId(workOrderId);
        reservation.setQuantity(quantity);
        reservation.setStatus(1);
        reservation.setExpireTime(LocalDateTime.now().plusHours(reservationExpireHours));
        reservation.setRemark(remark);
        save(reservation);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void releaseReservation(Long workOrderId, Long materialId) {
        List<MaterialReservation> reservations = list(new LambdaQueryWrapper<MaterialReservation>()
                .eq(MaterialReservation::getWorkOrderId, workOrderId)
                .eq(MaterialReservation::getMaterialId, materialId)
                .eq(MaterialReservation::getStatus, 1));
        for (MaterialReservation reservation : reservations) {
            reservation.setStatus(0);
            updateById(reservation);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmReservation(Long workOrderId, Long materialId) {
        List<MaterialReservation> reservations = list(new LambdaQueryWrapper<MaterialReservation>()
                .eq(MaterialReservation::getWorkOrderId, workOrderId)
                .eq(MaterialReservation::getMaterialId, materialId)
                .eq(MaterialReservation::getStatus, 1));
        for (MaterialReservation reservation : reservations) {
            reservation.setStatus(2);
            updateById(reservation);
        }
    }

    @Override
    public List<MaterialReservation> getByWorkOrderId(Long workOrderId) {
        return list(new LambdaQueryWrapper<MaterialReservation>()
                .eq(MaterialReservation::getWorkOrderId, workOrderId)
                .orderByDesc(MaterialReservation::getCreateTime));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void expireReservations() {
        List<MaterialReservation> expiredReservations = list(new LambdaQueryWrapper<MaterialReservation>()
                .eq(MaterialReservation::getStatus, 1)
                .lt(MaterialReservation::getExpireTime, LocalDateTime.now()));
        for (MaterialReservation reservation : expiredReservations) {
            reservation.setStatus(0);
            updateById(reservation);
        }
    }
}
