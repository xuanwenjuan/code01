package com.sheetmetal.compressor.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sheetmetal.compressor.context.UserContext;
import com.sheetmetal.compressor.dto.MaterialLockDTO;
import com.sheetmetal.compressor.entity.Material;
import com.sheetmetal.compressor.entity.MaterialLock;
import com.sheetmetal.compressor.entity.ProductionOrder;
import com.sheetmetal.compressor.exception.BusinessException;
import com.sheetmetal.compressor.mapper.MaterialLockMapper;
import com.sheetmetal.compressor.mapper.MaterialMapper;
import com.sheetmetal.compressor.mapper.ProductionOrderMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class MaterialLockService {

    @Autowired
    private MaterialLockMapper materialLockMapper;

    @Autowired
    private MaterialMapper materialMapper;

    @Autowired
    private ProductionOrderMapper orderMapper;

    public List<MaterialLock> getByOrderId(Long orderId) {
        return materialLockMapper.selectList(
                new LambdaQueryWrapper<MaterialLock>()
                        .eq(MaterialLock::getOrderId, orderId)
                        .orderByDesc(MaterialLock::getCreatedTime)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockMaterial(MaterialLockDTO dto) {
        ProductionOrder order = orderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (order.getProcessConfirmed() != null && order.getProcessConfirmed() == 1) {
            throw new BusinessException("该工单已确认工艺，请勿重复锁定原料");
        }

        for (MaterialLockDTO.LockItem item : dto.getItems()) {
            Material material = materialMapper.selectById(item.getMaterialId());
            if (material == null) {
                throw new BusinessException("原料不存在: " + item.getMaterialId());
            }

            if (material.getAvailableQuantity().compareTo(item.getLockQuantity()) < 0) {
                throw new BusinessException("原料库存不足: " + material.getMaterialName()
                        + ", 可用: " + material.getAvailableQuantity()
                        + ", 需要: " + item.getLockQuantity());
            }

            BigDecimal newAvailable = material.getAvailableQuantity().subtract(item.getLockQuantity());
            material.setAvailableQuantity(newAvailable);

            if (newAvailable.compareTo(material.getWarningQuantity()) <= 0) {
                material.setStatus(2);
            }

            materialMapper.updateById(material);

            MaterialLock lock = new MaterialLock();
            lock.setLockNo("LOCK" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS")));
            lock.setOrderId(dto.getOrderId());
            lock.setOrderNo(order.getOrderNo());
            lock.setMaterialId(material.getId());
            lock.setMaterialName(material.getMaterialName());
            lock.setMaterialCode(material.getMaterialCode());
            lock.setBatchNo(material.getBatchNo());
            lock.setLockQuantity(item.getLockQuantity());
            lock.setLockStatus(1);
            lock.setOperatorId(UserContext.getUserId());
            lock.setOperatorName(UserContext.getUsername());
            lock.setRemark(dto.getRemark());
            lock.setCreatedTime(LocalDateTime.now());
            lock.setUpdatedTime(LocalDateTime.now());
            materialLockMapper.insert(lock);
        }

        order.setProcessConfirmed(1);
        order.setProcessEngineerTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockMaterial(Long orderId, String reason) {
        ProductionOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        List<MaterialLock> locks = materialLockMapper.selectList(
                new LambdaQueryWrapper<MaterialLock>()
                        .eq(MaterialLock::getOrderId, orderId)
                        .eq(MaterialLock::getLockStatus, 1)
        );

        for (MaterialLock lock : locks) {
            Material material = materialMapper.selectById(lock.getMaterialId());
            if (material != null) {
                BigDecimal newAvailable = material.getAvailableQuantity().add(lock.getLockQuantity());
                material.setAvailableQuantity(newAvailable);

                if (newAvailable.compareTo(material.getWarningQuantity()) > 0) {
                    material.setStatus(1);
                }

                materialMapper.updateById(material);
            }

            lock.setLockStatus(2);
            lock.setRemark(lock.getRemark() == null ? reason : lock.getRemark() + "; " + reason);
            lock.setUpdatedTime(LocalDateTime.now());
            materialLockMapper.updateById(lock);
        }

        order.setProcessConfirmed(0);
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void consumeMaterial(Long orderId) {
        List<MaterialLock> locks = materialLockMapper.selectList(
                new LambdaQueryWrapper<MaterialLock>()
                        .eq(MaterialLock::getOrderId, orderId)
                        .eq(MaterialLock::getLockStatus, 1)
        );

        for (MaterialLock lock : locks) {
            lock.setLockStatus(3);
            lock.setUpdatedTime(LocalDateTime.now());
            materialLockMapper.updateById(lock);
        }
    }
}
