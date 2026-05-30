package com.construction.material.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.construction.material.common.PageQuery;
import com.construction.material.common.PageResult;
import com.construction.material.common.UserContext;
import com.construction.material.dto.*;
import com.construction.material.entity.MaterialCategory;
import com.construction.material.entity.MaterialInventory;
import com.construction.material.exception.BusinessException;
import com.construction.material.mapper.MaterialCategoryMapper;
import com.construction.material.mapper.MaterialInventoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MaterialInventoryService {

    private final MaterialInventoryMapper inventoryMapper;
    private final MaterialCategoryMapper categoryMapper;
    private final InventoryFlowService flowService;

    @Transactional(rollbackFor = Exception.class)
    public void addInventory(MaterialInventoryDTO dto) {
        MaterialCategory category = categoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException("品类不存在");
        }

        MaterialInventory inventory = new MaterialInventory();
        inventory.setCategoryId(dto.getCategoryId());
        inventory.setCategoryName(category.getCategoryName());
        inventory.setMaterialName(dto.getMaterialName());
        inventory.setMaterialCode(dto.getMaterialCode());
        inventory.setSpecification(dto.getSpecification());
        inventory.setUnit(dto.getUnit() != null ? dto.getUnit() : category.getUnit());
        inventory.setQuantity(dto.getQuantity());
        inventory.setUnitPrice(dto.getUnitPrice());
        inventory.setTotalAmount(dto.getQuantity().multiply(dto.getUnitPrice()));
        inventory.setBatchNo(generateBatchNo());
        inventory.setSupplier(dto.getSupplier());
        inventory.setWarehouse(dto.getWarehouse());
        inventory.setLocation(dto.getLocation());
        inventory.setProductionDate(dto.getProductionDate());
        inventory.setExpiryDate(dto.getExpiryDate());
        inventory.setMoistureProofDays(dto.getMoistureProofDays());
        inventory.setWarningQuantity(dto.getWarningQuantity() != null ? dto.getWarningQuantity() : BigDecimal.ZERO);
        inventory.setMaxQuantity(dto.getMaxQuantity());
        inventory.setRemark(dto.getRemark());

        inventory.setInventoryStatus(calculateInventoryStatus(inventory));

        inventoryMapper.insert(inventory);

        flowService.recordFlow(
                inventory.getId(),
                inventory.getMaterialName(),
                inventory.getSpecification(),
                inventory.getUnit(),
                inventory.getBatchNo(),
                1,
                BigDecimal.ZERO,
                inventory.getQuantity(),
                inventory.getUnitPrice(),
                null,
                inventory.getWarehouse(),
                "初始建库"
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateInventory(MaterialInventoryDTO dto) {
        MaterialInventory inventory = inventoryMapper.selectById(dto.getId());
        if (inventory == null) {
            throw new BusinessException("库存记录不存在");
        }

        MaterialCategory category = categoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException("品类不存在");
        }

        BigDecimal oldQuantity = inventory.getQuantity();

        inventory.setCategoryId(dto.getCategoryId());
        inventory.setCategoryName(category.getCategoryName());
        inventory.setMaterialName(dto.getMaterialName());
        inventory.setMaterialCode(dto.getMaterialCode());
        inventory.setSpecification(dto.getSpecification());
        inventory.setUnit(dto.getUnit() != null ? dto.getUnit() : category.getUnit());
        inventory.setQuantity(dto.getQuantity());
        inventory.setUnitPrice(dto.getUnitPrice());
        inventory.setTotalAmount(dto.getQuantity().multiply(dto.getUnitPrice()));
        inventory.setSupplier(dto.getSupplier());
        inventory.setWarehouse(dto.getWarehouse());
        inventory.setLocation(dto.getLocation());
        inventory.setProductionDate(dto.getProductionDate());
        inventory.setExpiryDate(dto.getExpiryDate());
        inventory.setMoistureProofDays(dto.getMoistureProofDays());
        inventory.setWarningQuantity(dto.getWarningQuantity());
        inventory.setMaxQuantity(dto.getMaxQuantity());
        inventory.setRemark(dto.getRemark());

        inventory.setInventoryStatus(calculateInventoryStatus(inventory));

        inventoryMapper.updateById(inventory);

        BigDecimal quantityDiff = dto.getQuantity().subtract(oldQuantity);
        if (quantityDiff.compareTo(BigDecimal.ZERO) != 0) {
            int flowType = quantityDiff.compareTo(BigDecimal.ZERO) > 0 ? 2 : 12;
            flowService.recordFlow(
                    inventory.getId(),
                    inventory.getMaterialName(),
                    inventory.getSpecification(),
                    inventory.getUnit(),
                    inventory.getBatchNo(),
                    flowType,
                    oldQuantity,
                    quantityDiff,
                    inventory.getUnitPrice(),
                    null,
                    inventory.getWarehouse(),
                    "调整库存数量"
            );
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteInventory(Long id) {
        MaterialInventory inventory = inventoryMapper.selectById(id);
        if (inventory == null) {
            throw new BusinessException("库存记录不存在");
        }
        inventoryMapper.deleteById(id);
    }

    public MaterialInventory getInventory(Long id) {
        return inventoryMapper.selectById(id);
    }

    public PageResult<MaterialInventory> getInventoryPage(PageQuery pageQuery, MaterialInventoryQueryDTO queryDTO) {
        LambdaQueryWrapper<MaterialInventory> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(pageQuery.getKeyword())) {
            wrapper.and(w -> w.like(MaterialInventory::getMaterialName, pageQuery.getKeyword())
                    .or()
                    .like(MaterialInventory::getMaterialCode, pageQuery.getKeyword())
                    .or()
                    .like(MaterialInventory::getSpecification, pageQuery.getKeyword())
                    .or()
                    .like(MaterialInventory::getBatchNo, pageQuery.getKeyword())
                    .or()
                    .like(MaterialInventory::getSupplier, pageQuery.getKeyword()));
        }
        if (queryDTO.getCategoryId() != null) {
            wrapper.eq(MaterialInventory::getCategoryId, queryDTO.getCategoryId());
        }
        if (queryDTO.getCategoryIds() != null && !queryDTO.getCategoryIds().isEmpty()) {
            wrapper.in(MaterialInventory::getCategoryId, queryDTO.getCategoryIds());
        }
        if (StringUtils.hasText(queryDTO.getMaterialName())) {
            wrapper.like(MaterialInventory::getMaterialName, queryDTO.getMaterialName());
        }
        if (StringUtils.hasText(queryDTO.getMaterialCode())) {
            wrapper.like(MaterialInventory::getMaterialCode, queryDTO.getMaterialCode());
        }
        if (StringUtils.hasText(queryDTO.getSpecification())) {
            wrapper.like(MaterialInventory::getSpecification, queryDTO.getSpecification());
        }
        if (queryDTO.getSpecifications() != null && !queryDTO.getSpecifications().isEmpty()) {
            wrapper.in(MaterialInventory::getSpecification, queryDTO.getSpecifications());
        }
        if (StringUtils.hasText(queryDTO.getBatchNo())) {
            wrapper.like(MaterialInventory::getBatchNo, queryDTO.getBatchNo());
        }
        if (StringUtils.hasText(queryDTO.getSupplier())) {
            wrapper.like(MaterialInventory::getSupplier, queryDTO.getSupplier());
        }
        if (StringUtils.hasText(queryDTO.getWarehouse())) {
            wrapper.eq(MaterialInventory::getWarehouse, queryDTO.getWarehouse());
        }
        if (queryDTO.getWarehouses() != null && !queryDTO.getWarehouses().isEmpty()) {
            wrapper.in(MaterialInventory::getWarehouse, queryDTO.getWarehouses());
        }
        if (queryDTO.getInventoryStatus() != null) {
            wrapper.eq(MaterialInventory::getInventoryStatus, queryDTO.getInventoryStatus());
        }
        if (queryDTO.getInventoryStatuses() != null && !queryDTO.getInventoryStatuses().isEmpty()) {
            wrapper.in(MaterialInventory::getInventoryStatus, queryDTO.getInventoryStatuses());
        }
        if (queryDTO.getMinQuantity() != null) {
            wrapper.ge(MaterialInventory::getQuantity, queryDTO.getMinQuantity());
        }
        if (queryDTO.getMaxQuantity() != null) {
            wrapper.le(MaterialInventory::getQuantity, queryDTO.getMaxQuantity());
        }
        if (queryDTO.getMinUnitPrice() != null) {
            wrapper.ge(MaterialInventory::getUnitPrice, queryDTO.getMinUnitPrice());
        }
        if (queryDTO.getMaxUnitPrice() != null) {
            wrapper.le(MaterialInventory::getUnitPrice, queryDTO.getMaxUnitPrice());
        }
        if (queryDTO.getMinTotalAmount() != null) {
            wrapper.ge(MaterialInventory::getTotalAmount, queryDTO.getMinTotalAmount());
        }
        if (queryDTO.getMaxTotalAmount() != null) {
            wrapper.le(MaterialInventory::getTotalAmount, queryDTO.getMaxTotalAmount());
        }
        if (queryDTO.getStartCreateTime() != null) {
            wrapper.ge(MaterialInventory::getCreateTime, queryDTO.getStartCreateTime());
        }
        if (queryDTO.getEndCreateTime() != null) {
            wrapper.le(MaterialInventory::getCreateTime, queryDTO.getEndCreateTime());
        }
        if (queryDTO.getStartProductionDate() != null) {
            wrapper.ge(MaterialInventory::getProductionDate, queryDTO.getStartProductionDate());
        }
        if (queryDTO.getEndProductionDate() != null) {
            wrapper.le(MaterialInventory::getProductionDate, queryDTO.getEndProductionDate());
        }
        if (queryDTO.getStartExpiryDate() != null) {
            wrapper.ge(MaterialInventory::getExpiryDate, queryDTO.getStartExpiryDate());
        }
        if (queryDTO.getEndExpiryDate() != null) {
            wrapper.le(MaterialInventory::getExpiryDate, queryDTO.getEndExpiryDate());
        }

        wrapper.eq(MaterialInventory::getDeleted, 0);

        applySort(wrapper, queryDTO.getSortField(), queryDTO.getSortOrder());

        Page<MaterialInventory> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        IPage<MaterialInventory> result = inventoryMapper.selectPage(page, wrapper);

        return new PageResult<>(result.getRecords(), result.getTotal(),
                (int) result.getCurrent(), (int) result.getSize());
    }

    private void applySort(LambdaQueryWrapper<MaterialInventory> wrapper, String sortField, String sortOrder) {
        boolean isAsc = sortOrder == null || "asc".equalsIgnoreCase(sortOrder);
        
        if (!StringUtils.hasText(sortField)) {
            wrapper.orderByDesc(MaterialInventory::getCreateTime);
            return;
        }

        switch (sortField) {
            case "quantity":
                if (isAsc) {
                    wrapper.orderByAsc(MaterialInventory::getQuantity);
                } else {
                    wrapper.orderByDesc(MaterialInventory::getQuantity);
                }
                break;
            case "unitPrice":
                if (isAsc) {
                    wrapper.orderByAsc(MaterialInventory::getUnitPrice);
                } else {
                    wrapper.orderByDesc(MaterialInventory::getUnitPrice);
                }
                break;
            case "totalAmount":
                if (isAsc) {
                    wrapper.orderByAsc(MaterialInventory::getTotalAmount);
                } else {
                    wrapper.orderByDesc(MaterialInventory::getTotalAmount);
                }
                break;
            case "materialName":
                if (isAsc) {
                    wrapper.orderByAsc(MaterialInventory::getMaterialName);
                } else {
                    wrapper.orderByDesc(MaterialInventory::getMaterialName);
                }
                break;
            case "createTime":
                if (isAsc) {
                    wrapper.orderByAsc(MaterialInventory::getCreateTime);
                } else {
                    wrapper.orderByDesc(MaterialInventory::getCreateTime);
                }
                break;
            case "inventoryStatus":
                if (isAsc) {
                    wrapper.orderByAsc(MaterialInventory::getInventoryStatus);
                } else {
                    wrapper.orderByDesc(MaterialInventory::getInventoryStatus);
                }
                break;
            default:
                wrapper.orderByDesc(MaterialInventory::getCreateTime);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void inboundInventory(InventoryInboundDTO dto) {
        for (InventoryInboundDetailDTO detail : dto.getDetails()) {
            MaterialCategory category = categoryMapper.selectById(detail.getCategoryId());
            if (category == null) {
                throw new BusinessException("品类不存在: " + detail.getCategoryId());
            }

            LambdaQueryWrapper<MaterialInventory> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(MaterialInventory::getCategoryId, detail.getCategoryId())
                    .eq(MaterialInventory::getSpecification, detail.getSpecification())
                    .eq(MaterialInventory::getWarehouse, dto.getWarehouse())
                    .eq(MaterialInventory::getDeleted, 0);

            MaterialInventory existInventory = inventoryMapper.selectOne(wrapper);
            BigDecimal oldQuantity = BigDecimal.ZERO;

            if (existInventory != null) {
                oldQuantity = existInventory.getQuantity();
                existInventory.setQuantity(oldQuantity.add(detail.getQuantity()));
                existInventory.setTotalAmount(existInventory.getQuantity().multiply(existInventory.getUnitPrice()));
                existInventory.setInventoryStatus(calculateInventoryStatus(existInventory));
                inventoryMapper.updateById(existInventory);

                flowService.recordFlow(
                        existInventory.getId(),
                        existInventory.getMaterialName(),
                        existInventory.getSpecification(),
                        existInventory.getUnit(),
                        existInventory.getBatchNo(),
                        1,
                        oldQuantity,
                        detail.getQuantity(),
                        existInventory.getUnitPrice(),
                        dto.getInboundNo(),
                        dto.getWarehouse(),
                        dto.getRemark()
                );
            } else {
                MaterialInventory inventory = new MaterialInventory();
                inventory.setCategoryId(detail.getCategoryId());
                inventory.setCategoryName(category.getCategoryName());
                inventory.setMaterialName(detail.getMaterialName() != null ? detail.getMaterialName() : category.getCategoryName());
                inventory.setMaterialCode(detail.getMaterialCode());
                inventory.setSpecification(detail.getSpecification());
                inventory.setUnit(detail.getUnit() != null ? detail.getUnit() : category.getUnit());
                inventory.setQuantity(detail.getQuantity());
                inventory.setUnitPrice(detail.getUnitPrice());
                inventory.setTotalAmount(detail.getQuantity().multiply(detail.getUnitPrice()));
                inventory.setBatchNo(generateBatchNo());
                inventory.setSupplier(dto.getSupplier());
                inventory.setWarehouse(dto.getWarehouse());
                inventory.setLocation(detail.getLocation());
                inventory.setProductionDate(detail.getProductionDate());
                inventory.setExpiryDate(detail.getExpiryDate());
                inventory.setMoistureProofDays(detail.getMoistureProofDays());
                inventory.setWarningQuantity(detail.getWarningQuantity() != null ? detail.getWarningQuantity() : BigDecimal.ZERO);
                inventory.setRemark(detail.getRemark());
                inventory.setInventoryStatus(calculateInventoryStatus(inventory));

                inventoryMapper.insert(inventory);

                flowService.recordFlow(
                        inventory.getId(),
                        inventory.getMaterialName(),
                        inventory.getSpecification(),
                        inventory.getUnit(),
                        inventory.getBatchNo(),
                        1,
                        BigDecimal.ZERO,
                        inventory.getQuantity(),
                        inventory.getUnitPrice(),
                        dto.getInboundNo(),
                        dto.getWarehouse(),
                        dto.getRemark()
                );
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void transferInventory(InventoryTransferDTO dto) {
        for (InventoryTransferDetailDTO detail : dto.getDetails()) {
            MaterialInventory fromInventory = inventoryMapper.selectById(detail.getInventoryId());
            if (fromInventory == null) {
                throw new BusinessException("库存记录不存在: " + detail.getInventoryId());
            }
            if (!fromInventory.getWarehouse().equals(dto.getFromWarehouse())) {
                throw new BusinessException("库存不在调出仓库: " + fromInventory.getMaterialName());
            }
            if (fromInventory.getQuantity().compareTo(detail.getQuantity()) < 0) {
                throw new BusinessException("调出库存不足: " + fromInventory.getMaterialName());
            }

            BigDecimal oldFromQuantity = fromInventory.getQuantity();
            fromInventory.setQuantity(oldFromQuantity.subtract(detail.getQuantity()));
            fromInventory.setInventoryStatus(calculateInventoryStatus(fromInventory));
            inventoryMapper.updateById(fromInventory);

            flowService.recordFlow(
                    fromInventory.getId(),
                    fromInventory.getMaterialName(),
                    fromInventory.getSpecification(),
                    fromInventory.getUnit(),
                    fromInventory.getBatchNo(),
                    12,
                    oldFromQuantity,
                    detail.getQuantity().negate(),
                    fromInventory.getUnitPrice(),
                    null,
                    dto.getFromWarehouse(),
                    "调拨至" + dto.getToWarehouse()
            );

            LambdaQueryWrapper<MaterialInventory> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(MaterialInventory::getCategoryId, fromInventory.getCategoryId())
                    .eq(MaterialInventory::getSpecification, fromInventory.getSpecification())
                    .eq(MaterialInventory::getWarehouse, dto.getToWarehouse())
                    .eq(MaterialInventory::getDeleted, 0);

            MaterialInventory toInventory = inventoryMapper.selectOne(wrapper);
            if (toInventory != null) {
                BigDecimal oldToQuantity = toInventory.getQuantity();
                toInventory.setQuantity(oldToQuantity.add(detail.getQuantity()));
                toInventory.setTotalAmount(toInventory.getQuantity().multiply(toInventory.getUnitPrice()));
                toInventory.setInventoryStatus(calculateInventoryStatus(toInventory));
                inventoryMapper.updateById(toInventory);

                flowService.recordFlow(
                        toInventory.getId(),
                        toInventory.getMaterialName(),
                        toInventory.getSpecification(),
                        toInventory.getUnit(),
                        toInventory.getBatchNo(),
                        2,
                        oldToQuantity,
                        detail.getQuantity(),
                        toInventory.getUnitPrice(),
                        null,
                        dto.getToWarehouse(),
                        "从" + dto.getFromWarehouse() + "调拨入库"
                );
            } else {
                MaterialInventory newInventory = new MaterialInventory();
                newInventory.setCategoryId(fromInventory.getCategoryId());
                newInventory.setCategoryName(fromInventory.getCategoryName());
                newInventory.setMaterialName(fromInventory.getMaterialName());
                newInventory.setMaterialCode(fromInventory.getMaterialCode());
                newInventory.setSpecification(fromInventory.getSpecification());
                newInventory.setUnit(fromInventory.getUnit());
                newInventory.setQuantity(detail.getQuantity());
                newInventory.setUnitPrice(fromInventory.getUnitPrice());
                newInventory.setTotalAmount(detail.getQuantity().multiply(fromInventory.getUnitPrice()));
                newInventory.setBatchNo(generateBatchNo());
                newInventory.setSupplier(fromInventory.getSupplier());
                newInventory.setWarehouse(dto.getToWarehouse());
                newInventory.setProductionDate(fromInventory.getProductionDate());
                newInventory.setExpiryDate(fromInventory.getExpiryDate());
                newInventory.setMoistureProofDays(fromInventory.getMoistureProofDays());
                newInventory.setWarningQuantity(fromInventory.getWarningQuantity());
                newInventory.setInventoryStatus(calculateInventoryStatus(newInventory));

                inventoryMapper.insert(newInventory);

                flowService.recordFlow(
                        newInventory.getId(),
                        newInventory.getMaterialName(),
                        newInventory.getSpecification(),
                        newInventory.getUnit(),
                        newInventory.getBatchNo(),
                        2,
                        BigDecimal.ZERO,
                        newInventory.getQuantity(),
                        newInventory.getUnitPrice(),
                        null,
                        dto.getToWarehouse(),
                        "从" + dto.getFromWarehouse() + "调拨入库"
                );
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> checkInventory(InventoryCheckDTO dto) {
        BigDecimal totalProfit = BigDecimal.ZERO;
        BigDecimal totalLoss = BigDecimal.ZERO;
        int profitCount = 0;
        int lossCount = 0;

        for (InventoryCheckDetailDTO detail : dto.getDetails()) {
            MaterialInventory inventory = inventoryMapper.selectById(detail.getInventoryId());
            if (inventory == null) {
                throw new BusinessException("库存记录不存在: " + detail.getInventoryId());
            }

            BigDecimal diff = detail.getCheckQuantity().subtract(inventory.getQuantity());

            if (diff.compareTo(BigDecimal.ZERO) != 0) {
                BigDecimal oldQuantity = inventory.getQuantity();
                inventory.setQuantity(detail.getCheckQuantity());
                inventory.setInventoryStatus(calculateInventoryStatus(inventory));
                inventoryMapper.updateById(inventory);

                int flowType = diff.compareTo(BigDecimal.ZERO) > 0 ? 3 : 13;
                flowService.recordFlow(
                        inventory.getId(),
                        inventory.getMaterialName(),
                        inventory.getSpecification(),
                        inventory.getUnit(),
                        inventory.getBatchNo(),
                        flowType,
                        oldQuantity,
                        diff,
                        inventory.getUnitPrice(),
                        null,
                        dto.getWarehouse(),
                        detail.getRemark()
                );

                BigDecimal diffAmount = diff.multiply(inventory.getUnitPrice());
                if (diff.compareTo(BigDecimal.ZERO) > 0) {
                    totalProfit = totalProfit.add(diffAmount);
                    profitCount++;
                } else {
                    totalLoss = totalLoss.add(diffAmount.abs());
                    lossCount++;
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalProfit", totalProfit);
        result.put("totalLoss", totalLoss);
        result.put("profitCount", profitCount);
        result.put("lossCount", lossCount);
        result.put("checkBy", UserContext.getUsername());
        result.put("checkTime", LocalDateTime.now());

        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public void stockIn(Long id, BigDecimal quantity) {
        MaterialInventory inventory = inventoryMapper.selectById(id);
        if (inventory == null) {
            throw new BusinessException("库存记录不存在");
        }
        BigDecimal oldQuantity = inventory.getQuantity();
        inventoryMapper.addQuantity(id, quantity);
        inventory.setQuantity(oldQuantity.add(quantity));
        inventory.setInventoryStatus(calculateInventoryStatus(inventory));
        inventoryMapper.updateById(inventory);

        flowService.recordFlow(
                id,
                inventory.getMaterialName(),
                inventory.getSpecification(),
                inventory.getUnit(),
                inventory.getBatchNo(),
                1,
                oldQuantity,
                quantity,
                inventory.getUnitPrice(),
                null,
                inventory.getWarehouse(),
                "手动入库"
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void stockOut(Long id, BigDecimal quantity) {
        MaterialInventory inventory = inventoryMapper.selectById(id);
        if (inventory == null) {
            throw new BusinessException("库存记录不存在");
        }
        if (inventory.getQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("库存不足");
        }
        BigDecimal oldQuantity = inventory.getQuantity();
        int rows = inventoryMapper.deductQuantity(id, quantity);
        if (rows == 0) {
            throw new BusinessException("扣减库存失败");
        }
        inventory.setQuantity(oldQuantity.subtract(quantity));
        inventory.setInventoryStatus(calculateInventoryStatus(inventory));
        inventoryMapper.updateById(inventory);

        flowService.recordFlow(
                id,
                inventory.getMaterialName(),
                inventory.getSpecification(),
                inventory.getUnit(),
                inventory.getBatchNo(),
                11,
                oldQuantity,
                quantity.negate(),
                inventory.getUnitPrice(),
                null,
                inventory.getWarehouse(),
                "手动出库"
        );
    }

    public List<MaterialInventory> getWarningInventory() {
        return inventoryMapper.selectWarningInventory();
    }

    public List<MaterialInventory> getMoistureProofWarning() {
        return inventoryMapper.selectMoistureProofWarning();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateInventoryStatus() {
        List<MaterialInventory> inventories = inventoryMapper.selectList(
                new LambdaQueryWrapper<MaterialInventory>().eq(MaterialInventory::getDeleted, 0)
        );
        for (MaterialInventory inventory : inventories) {
            int newStatus = calculateInventoryStatus(inventory);
            if (newStatus != inventory.getInventoryStatus()) {
                inventory.setInventoryStatus(newStatus);
                inventoryMapper.updateById(inventory);
            }
        }
    }

    public Map<String, Object> getInventorySummary(String warehouse) {
        LambdaQueryWrapper<MaterialInventory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialInventory::getDeleted, 0);
        if (StringUtils.hasText(warehouse)) {
            wrapper.eq(MaterialInventory::getWarehouse, warehouse);
        }

        List<MaterialInventory> inventories = inventoryMapper.selectList(wrapper);

        BigDecimal totalQuantity = BigDecimal.ZERO;
        BigDecimal totalAmount = BigDecimal.ZERO;
        long warningCount = 0;
        long outOfStockCount = 0;
        long expiredCount = 0;

        for (MaterialInventory inventory : inventories) {
            totalQuantity = totalQuantity.add(inventory.getQuantity());
            totalAmount = totalAmount.add(inventory.getTotalAmount());

            if (inventory.getInventoryStatus() == 2) {
                warningCount++;
            } else if (inventory.getInventoryStatus() == 3) {
                outOfStockCount++;
            } else if (inventory.getInventoryStatus() == 4 || inventory.getInventoryStatus() == 5) {
                expiredCount++;
            }
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalItems", inventories.size());
        summary.put("totalQuantity", totalQuantity);
        summary.put("totalAmount", totalAmount);
        summary.put("warningCount", warningCount);
        summary.put("outOfStockCount", outOfStockCount);
        summary.put("expiredCount", expiredCount);

        return summary;
    }

    public List<Map<String, Object>> getInventoryByCategory(String warehouse) {
        LambdaQueryWrapper<MaterialInventory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialInventory::getDeleted, 0);
        if (StringUtils.hasText(warehouse)) {
            wrapper.eq(MaterialInventory::getWarehouse, warehouse);
        }

        List<MaterialInventory> inventories = inventoryMapper.selectList(wrapper);

        Map<Long, Map<String, Object>> categoryMap = new HashMap<>();

        for (MaterialInventory inventory : inventories) {
            Long categoryId = inventory.getCategoryId();
            Map<String, Object> categoryData = categoryMap.computeIfAbsent(categoryId, k -> {
                Map<String, Object> map = new HashMap<>();
                map.put("categoryId", inventory.getCategoryId());
                map.put("categoryName", inventory.getCategoryName());
                map.put("totalQuantity", BigDecimal.ZERO);
                map.put("totalAmount", BigDecimal.ZERO);
                map.put("itemCount", 0);
                return map;
            });

            categoryData.put("totalQuantity",
                    ((BigDecimal) categoryData.get("totalQuantity")).add(inventory.getQuantity()));
            categoryData.put("totalAmount",
                    ((BigDecimal) categoryData.get("totalAmount")).add(inventory.getTotalAmount()));
            categoryData.put("itemCount", (Integer) categoryData.get("itemCount") + 1);
        }

        return new ArrayList<>(categoryMap.values());
    }

    private int calculateInventoryStatus(MaterialInventory inventory) {
        if (inventory.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            return 3;
        }
        if (inventory.getWarningQuantity() != null &&
                inventory.getQuantity().compareTo(inventory.getWarningQuantity()) <= 0) {
            return 2;
        }
        if (inventory.getExpiryDate() != null && inventory.getExpiryDate().isBefore(LocalDateTime.now())) {
            return 4;
        }
        if (inventory.getMoistureProofDays() != null && inventory.getMoistureProofDays() > 0
                && inventory.getProductionDate() != null) {
            LocalDateTime moistureExpiry = inventory.getProductionDate().plusDays(inventory.getMoistureProofDays());
            if (moistureExpiry.isBefore(LocalDateTime.now())) {
                return 5;
            }
        }
        return 1;
    }

    private String generateBatchNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "BATCH-" + dateStr + "-" + uuid;
    }
}
