package com.radiator.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.radiator.management.entity.MaterialInventory;
import com.radiator.management.entity.StockInventory;
import com.radiator.management.entity.StockInventoryDetail;
import com.radiator.management.exception.BusinessException;
import com.radiator.management.mapper.MaterialInventoryMapper;
import com.radiator.management.mapper.StockInventoryDetailMapper;
import com.radiator.management.mapper.StockInventoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockInventoryService {

    private final StockInventoryMapper inventoryMapper;
    private final StockInventoryDetailMapper detailMapper;
    private final MaterialInventoryMapper materialInventoryMapper;

    @Transactional(rollbackFor = Exception.class)
    public void createInventory(StockInventory inventory, Long userId) {
        String inventoryNo = "INV" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        inventory.setInventoryNo(inventoryNo);
        inventory.setStatus("DRAFT");
        inventory.setCreateBy(userId);

        List<MaterialInventory> materials = materialInventoryMapper.selectList(
                new LambdaQueryWrapper<MaterialInventory>()
                        .eq(inventory.getWarehouseId() != null, MaterialInventory::getWarehouseId, inventory.getWarehouseId())
        );

        int totalItems = materials.size();
        inventory.setTotalItems(totalItems);
        inventory.setDiscrepancyItems(0);
        inventoryMapper.insert(inventory);

        for (MaterialInventory material : materials) {
            StockInventoryDetail detail = new StockInventoryDetail();
            detail.setInventoryId(inventory.getId());
            detail.setMaterialId(material.getId());
            detail.setMaterialCode(material.getMaterialCode());
            detail.setMaterialName(material.getMaterialName());
            detail.setSpecification(material.getSpecification());
            detail.setUnit(material.getUnit());
            detail.setBatchNo(material.getBatchNo());
            detail.setSystemQuantity(material.getQuantity());
            detail.setActualQuantity(BigDecimal.ZERO);
            detail.setDifferenceQuantity(BigDecimal.ZERO);
            detailMapper.insert(detail);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateInventoryDetail(Long inventoryId, List<StockInventoryDetail> details) {
        StockInventory inventory = inventoryMapper.selectById(inventoryId);
        if (inventory == null || !"DRAFT".equals(inventory.getStatus())) {
            throw new BusinessException("盘点单不存在或不是草稿状态");
        }

        int discrepancyItems = 0;
        for (StockInventoryDetail detail : details) {
            detail.setDifferenceQuantity(detail.getActualQuantity().subtract(detail.getSystemQuantity()));
            if (detail.getDifferenceQuantity().compareTo(BigDecimal.ZERO) != 0) {
                discrepancyItems++;
            }
            detailMapper.updateById(detail);
        }

        inventory.setDiscrepancyItems(discrepancyItems);
        inventoryMapper.updateById(inventory);
    }

    @Transactional(rollbackFor = Exception.class)
    public void submitInventory(Long id) {
        StockInventory inventory = inventoryMapper.selectById(id);
        if (inventory == null) {
            throw new BusinessException("盘点单不存在");
        }
        if (!"DRAFT".equals(inventory.getStatus())) {
            throw new BusinessException("只有草稿状态的盘点单可以提交");
        }
        inventory.setStatus("PENDING");
        inventoryMapper.updateById(inventory);
    }

    @Transactional(rollbackFor = Exception.class)
    public void approveInventory(Long id, Long approverId) {
        StockInventory inventory = inventoryMapper.selectById(id);
        if (inventory == null) {
            throw new BusinessException("盘点单不存在");
        }
        if (!"PENDING".equals(inventory.getStatus())) {
            throw new BusinessException("只有待审核状态的盘点单可以审核");
        }

        List<StockInventoryDetail> details = detailMapper.selectList(
                new LambdaQueryWrapper<StockInventoryDetail>().eq(StockInventoryDetail::getInventoryId, id)
        );

        for (StockInventoryDetail detail : details) {
            if (detail.getDifferenceQuantity().compareTo(BigDecimal.ZERO) != 0) {
                MaterialInventory material = materialInventoryMapper.selectById(detail.getMaterialId());
                if (material != null) {
                    material.setQuantity(detail.getActualQuantity());
                    materialInventoryMapper.updateById(material);
                }
            }
        }

        inventory.setStatus("COMPLETED");
        inventory.setApproverId(approverId);
        inventory.setApproveTime(LocalDateTime.now());
        inventoryMapper.updateById(inventory);
    }

    @Transactional(rollbackFor = Exception.class)
    public void rejectInventory(Long id, String remark) {
        StockInventory inventory = inventoryMapper.selectById(id);
        if (inventory == null) {
            throw new BusinessException("盘点单不存在");
        }
        inventory.setStatus("REJECTED");
        inventory.setRemark(remark);
        inventoryMapper.updateById(inventory);
    }

    public Page<StockInventory> listInventories(int page, int size, String status, Long warehouseId) {
        LambdaQueryWrapper<StockInventory> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(StockInventory::getStatus, status);
        }
        if (warehouseId != null) {
            wrapper.eq(StockInventory::getWarehouseId, warehouseId);
        }
        wrapper.orderByDesc(StockInventory::getCreateTime);
        return inventoryMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public StockInventory getInventoryById(Long id) {
        StockInventory inventory = inventoryMapper.selectById(id);
        if (inventory != null) {
            List<StockInventoryDetail> details = detailMapper.selectList(
                    new LambdaQueryWrapper<StockInventoryDetail>().eq(StockInventoryDetail::getInventoryId, id)
            );
            inventory.setDetails(details);
        }
        return inventory;
    }

    public List<StockInventoryDetail> getInventoryDetails(Long inventoryId) {
        return detailMapper.selectList(
                new LambdaQueryWrapper<StockInventoryDetail>().eq(StockInventoryDetail::getInventoryId, inventoryId)
        );
    }
}
