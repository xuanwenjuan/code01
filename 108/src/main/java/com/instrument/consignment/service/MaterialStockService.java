package com.instrument.consignment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.instrument.consignment.dto.MaterialLockDTO;
import com.instrument.consignment.exception.BusinessException;
import com.instrument.consignment.mapper.MaterialLockMapper;
import com.instrument.consignment.mapper.MaterialStockMapper;
import com.instrument.consignment.po.MaterialLockPO;
import com.instrument.consignment.po.MaterialStockPO;
import com.instrument.consignment.vo.MaterialStockVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialStockService {

    private final MaterialStockMapper stockMapper;
    private final MaterialLockMapper lockMapper;

    @Transactional(rollbackFor = Exception.class)
    public void lockMaterialForWorkOrder(Long workOrderId, List<MaterialLockDTO> materials) {
        for (MaterialLockDTO material : materials) {
            MaterialStockPO stock = stockMapper.selectById(material.getMaterialId());
            if (stock == null) {
                throw new BusinessException("材料不存在: " + material.getMaterialId());
            }

            if (stock.getAvailableQuantity() < material.getQuantity()) {
                throw new BusinessException("材料库存不足: " + stock.getMaterialName() +
                        ", 可用: " + stock.getAvailableQuantity() +
                        ", 需要: " + material.getQuantity());
            }

            int affected = stockMapper.lockStock(material.getMaterialId(), material.getQuantity());
            if (affected == 0) {
                throw new BusinessException("锁定库存失败: " + stock.getMaterialName());
            }

            MaterialLockPO lockPO = new MaterialLockPO();
            lockPO.setWorkOrderId(workOrderId);
            lockPO.setMaterialId(material.getMaterialId());
            lockPO.setMaterialCode(stock.getMaterialCode());
            lockPO.setMaterialName(stock.getMaterialName());
            lockPO.setLockQuantity(material.getQuantity());
            lockPO.setLockPrice(stock.getUnitPrice());
            lockPO.setLockAmount(stock.getUnitPrice().multiply(new BigDecimal(material.getQuantity())));
            lockPO.setStatus(1);
            lockMapper.insert(lockPO);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockMaterialForWorkOrder(Long workOrderId) {
        List<MaterialLockPO> locks = lockMapper.selectList(
                new LambdaQueryWrapper<MaterialLockPO>()
                        .eq(MaterialLockPO::getWorkOrderId, workOrderId)
                        .eq(MaterialLockPO::getStatus, 1)
        );

        for (MaterialLockPO lock : locks) {
            stockMapper.unlockStock(lock.getMaterialId(), lock.getLockQuantity());
            lock.setStatus(0);
            lockMapper.updateById(lock);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void deductMaterialForWorkOrder(Long workOrderId) {
        List<MaterialLockPO> locks = lockMapper.selectList(
                new LambdaQueryWrapper<MaterialLockPO>()
                        .eq(MaterialLockPO::getWorkOrderId, workOrderId)
                        .eq(MaterialLockPO::getStatus, 1)
        );

        for (MaterialLockPO lock : locks) {
            stockMapper.deductStock(lock.getMaterialId(), lock.getLockQuantity());
            lock.setStatus(2);
            lockMapper.updateById(lock);
        }
    }

    public Page<MaterialStockVO> getStockPage(int page, int size, String materialType, String keyword) {
        Page<MaterialStockPO> pageParam = new Page<>(page, size);
        Page<MaterialStockPO> poPage = stockMapper.selectPage(pageParam,
                new LambdaQueryWrapper<MaterialStockPO>()
                        .eq(materialType != null, MaterialStockPO::getMaterialType, materialType)
                        .and(keyword != null, w -> w
                                .like(MaterialStockPO::getMaterialCode, keyword)
                                .or()
                                .like(MaterialStockPO::getMaterialName, keyword)
                        )
                        .orderByDesc(MaterialStockPO::getCreateTime)
        );

        Page<MaterialStockVO> voPage = new Page<>(poPage.getCurrent(), poPage.getSize(), poPage.getTotal());
        voPage.setRecords(poPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList()));
        return voPage;
    }

    private MaterialStockVO convertToVO(MaterialStockPO po) {
        MaterialStockVO vo = new MaterialStockVO();
        BeanUtils.copyProperties(po, vo);
        vo.setMaterialTypeDesc(getMaterialTypeDesc(po.getMaterialType()));
        return vo;
    }

    private String getMaterialTypeDesc(String type) {
        return switch (type) {
            case "STRING" -> "琴弦类";
            case "WOOD" -> "木材类";
            case "METAL" -> "金属配件";
            case "CLEANING" -> "清洁用品";
            case "OTHER" -> "其他";
            default -> type;
        };
    }
}
