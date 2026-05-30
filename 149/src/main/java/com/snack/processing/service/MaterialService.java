package com.snack.processing.service;

import cn.hutool.core.date.DateUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snack.processing.annotation.OperationLog;
import com.snack.processing.common.Result;
import com.snack.processing.common.ResultCode;
import com.snack.processing.dto.material.MaterialAddDTO;
import com.snack.processing.dto.material.MaterialQueryDTO;
import com.snack.processing.dto.material.StockInDTO;
import com.snack.processing.dto.material.StockQueryDTO;
import com.snack.processing.entity.Material;
import com.snack.processing.entity.MaterialStock;
import com.snack.processing.exception.BusinessException;
import com.snack.processing.mapper.MaterialMapper;
import com.snack.processing.mapper.MaterialStockMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;

import com.snack.processing.entity.WorkOrder;
import com.snack.processing.entity.WorkOrderMaterial;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaterialService extends ServiceImpl<MaterialMapper, Material> {

    private final MaterialMapper materialMapper;
    private final MaterialStockMapper stockMapper;

    @OperationLog(module = "原辅材料管理", operation = "新增材料", description = "新增加工原辅材料")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> addMaterial(MaterialAddDTO dto) {
        Material exists = materialMapper.selectOne(new LambdaQueryWrapper<Material>()
                .eq(Material::getCode, dto.getCode()));

        if (exists != null) {
            throw new BusinessException(ResultCode.DATA_EXISTS, "材料编码已存在");
        }

        Material material = new Material();
        material.setName(dto.getName());
        material.setCode(dto.getCode());
        material.setCategoryId(dto.getCategoryId());
        material.setCategoryName(dto.getCategoryName());
        material.setUnit(dto.getUnit());
        material.setSpec(dto.getSpec());
        material.setWarningStock(dto.getWarningStock());
        material.setMaxStock(dto.getMaxStock());
        material.setIsFresh(dto.getIsFresh());
        material.setShelfLifeDays(dto.getShelfLifeDays());
        material.setSupplier(dto.getSupplier());
        material.setStatus(dto.getStatus());
        material.setDescription(dto.getDescription());

        materialMapper.insert(material);
        return Result.success();
    }

    @OperationLog(module = "原辅材料管理", operation = "更新材料", description = "更新原辅材料信息")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> updateMaterial(Long id, MaterialAddDTO dto) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        Material exists = materialMapper.selectOne(new LambdaQueryWrapper<Material>()
                .eq(Material::getCode, dto.getCode())
                .ne(Material::getId, id));

        if (exists != null) {
            throw new BusinessException(ResultCode.DATA_EXISTS, "材料编码已存在");
        }

        material.setName(dto.getName());
        material.setCode(dto.getCode());
        material.setCategoryId(dto.getCategoryId());
        material.setCategoryName(dto.getCategoryName());
        material.setUnit(dto.getUnit());
        material.setSpec(dto.getSpec());
        material.setWarningStock(dto.getWarningStock());
        material.setMaxStock(dto.getMaxStock());
        material.setIsFresh(dto.getIsFresh());
        material.setShelfLifeDays(dto.getShelfLifeDays());
        material.setSupplier(dto.getSupplier());
        material.setStatus(dto.getStatus());
        material.setDescription(dto.getDescription());

        materialMapper.updateById(material);
        return Result.success();
    }

    @OperationLog(module = "原辅材料管理", operation = "删除材料", description = "删除原辅材料")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> deleteMaterial(Long id) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        Long stockCount = stockMapper.selectCount(new LambdaQueryWrapper<MaterialStock>()
                .eq(MaterialStock::getMaterialId, id)
                .gt(MaterialStock::getAvailableQuantity, BigDecimal.ZERO));

        if (stockCount > 0) {
            throw new BusinessException(ResultCode.DATA_IN_USE, "该材料存在库存，无法删除");
        }

        materialMapper.deleteById(id);
        return Result.success();
    }

    @OperationLog(module = "原辅材料管理", operation = "禁止采购", description = "设置材料禁止采购")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> disablePurchase(Long id) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        material.setStatus(0);
        materialMapper.updateById(material);
        return Result.success();
    }

    @OperationLog(module = "原辅材料管理", operation = "允许采购", description = "设置材料允许采购")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> enablePurchase(Long id) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        material.setStatus(1);
        materialMapper.updateById(material);
        return Result.success();
    }

    public Result<Material> getMaterialById(Long id) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }
        return Result.success(material);
    }

    public Result<IPage<Material>> getMaterialPage(MaterialQueryDTO dto) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(dto.getName() != null, Material::getName, dto.getName())
                .eq(dto.getCode() != null, Material::getCode, dto.getCode())
                .eq(dto.getCategoryId() != null, Material::getCategoryId, dto.getCategoryId())
                .eq(dto.getIsFresh() != null, Material::getIsFresh, dto.getIsFresh())
                .eq(dto.getStatus() != null, Material::getStatus, dto.getStatus())
                .like(dto.getSupplier() != null, Material::getSupplier, dto.getSupplier())
                .orderByDesc(Material::getCreateTime);

        IPage<Material> page = materialMapper.selectPage(dto.buildPage(), wrapper);
        return Result.success(page);
    }

    @OperationLog(module = "原辅材料管理", operation = "材料入库", description = "原辅材料入库")
    @Transactional(rollbackFor = Exception.class)
    public Result<MaterialStock> stockIn(StockInDTO dto) {
        Material material = materialMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND, "材料不存在");
        }

        String batchNo = generateBatchNo(material.getCode());

        MaterialStock stock = new MaterialStock();
        stock.setMaterialId(dto.getMaterialId());
        stock.setMaterialName(material.getName());
        stock.setMaterialCode(material.getCode());
        stock.setBatchNo(batchNo);
        stock.setTotalQuantity(dto.getQuantity());
        stock.setAvailableQuantity(dto.getQuantity());
        stock.setLockedQuantity(BigDecimal.ZERO);
        stock.setUsedQuantity(BigDecimal.ZERO);
        stock.setUnit(material.getUnit());
        stock.setUnitPrice(dto.getUnitPrice());
        stock.setTotalAmount(dto.getQuantity().multiply(dto.getUnitPrice()));
        stock.setProductionDate(dto.getProductionDate());
        stock.setExpireDate(dto.getExpireDate());
        stock.setStockStatus(1);
        stock.setWarehouse(dto.getWarehouse());
        stock.setLocation(dto.getLocation());
        stock.setRemark(dto.getRemark());

        if (dto.getExpireDate() != null) {
            LocalDate now = LocalDate.now();
            long daysUntilExpire = ChronoUnit.DAYS.between(now, dto.getExpireDate());
            if (daysUntilExpire <= 7) {
                stock.setIsExpiring(1);
            } else {
                stock.setIsExpiring(0);
            }
            if (daysUntilExpire < 0) {
                stock.setStockStatus(3);
            }
        }

        stockMapper.insert(stock);

        updateStockStatus(dto.getMaterialId());

        return Result.success(stock);
    }

    @OperationLog(module = "原辅材料管理", operation = "材料出库", description = "原辅材料出库")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> stockOut(Long stockId, BigDecimal quantity) {
        MaterialStock stock = stockMapper.selectById(stockId);
        if (stock == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND, "库存记录不存在");
        }

        if (stock.getAvailableQuantity().compareTo(quantity) < 0) {
            throw new BusinessException(ResultCode.STOCK_NOT_ENOUGH);
        }

        stock.setAvailableQuantity(stock.getAvailableQuantity().subtract(quantity));
        stock.setUsedQuantity(stock.getUsedQuantity().add(quantity));

        stockMapper.updateById(stock);

        updateStockStatus(stock.getMaterialId());

        return Result.success();
    }

    @OperationLog(module = "原辅材料管理", operation = "锁定库存", description = "锁定材料库存")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> lockStock(Long stockId, BigDecimal quantity) {
        MaterialStock stock = stockMapper.selectById(stockId);
        if (stock == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND, "库存记录不存在");
        }

        if (stock.getAvailableQuantity().compareTo(quantity) < 0) {
            throw new BusinessException(ResultCode.STOCK_NOT_ENOUGH);
        }

        stock.setAvailableQuantity(stock.getAvailableQuantity().subtract(quantity));
        stock.setLockedQuantity(stock.getLockedQuantity().add(quantity));

        stockMapper.updateById(stock);

        return Result.success();
    }

    @OperationLog(module = "原辅材料管理", operation = "解锁库存", description = "解锁材料库存")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> unlockStock(Long stockId, BigDecimal quantity) {
        MaterialStock stock = stockMapper.selectById(stockId);
        if (stock == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND, "库存记录不存在");
        }

        if (stock.getLockedQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("锁定数量不足，无法解锁");
        }

        stock.setAvailableQuantity(stock.getAvailableQuantity().add(quantity));
        stock.setLockedQuantity(stock.getLockedQuantity().subtract(quantity));

        stockMapper.updateById(stock);

        return Result.success();
    }

    public Result<IPage<MaterialStock>> getStockPage(StockQueryDTO dto) {
        LambdaQueryWrapper<MaterialStock> wrapper = new LambdaQueryWrapper<>();

        wrapper.eq(dto.getMaterialId() != null, MaterialStock::getMaterialId, dto.getMaterialId())
                .like(dto.getMaterialName() != null && !dto.getMaterialName().trim().isEmpty(),
                        MaterialStock::getMaterialName, dto.getMaterialName().trim())
                .eq(dto.getMaterialCode() != null && !dto.getMaterialCode().trim().isEmpty(),
                        MaterialStock::getMaterialCode, dto.getMaterialCode().trim())
                .eq(dto.getBatchNo() != null && !dto.getBatchNo().trim().isEmpty(),
                        MaterialStock::getBatchNo, dto.getBatchNo().trim())
                .eq(dto.getStockStatus() != null, MaterialStock::getStockStatus, dto.getStockStatus())
                .eq(dto.getIsExpiring() != null, MaterialStock::getIsExpiring, dto.getIsExpiring())
                .ge(dto.getExpireDateStart() != null, MaterialStock::getExpireDate, dto.getExpireDateStart())
                .le(dto.getExpireDateEnd() != null, MaterialStock::getExpireDate, dto.getExpireDateEnd())
                .like(dto.getWarehouse() != null && !dto.getWarehouse().trim().isEmpty(),
                        MaterialStock::getWarehouse, dto.getWarehouse().trim())
                .like(dto.getLocation() != null && !dto.getLocation().trim().isEmpty(),
                        MaterialStock::getLocation, dto.getLocation().trim())
                .ge(dto.getMinQuantity() != null, MaterialStock::getAvailableQuantity, dto.getMinQuantity())
                .le(dto.getMaxQuantity() != null, MaterialStock::getAvailableQuantity, dto.getMaxQuantity());

        if (dto.getCategoryId() != null) {
            List<Long> materialIds = materialMapper.selectList(
                            new LambdaQueryWrapper<Material>()
                                    .eq(Material::getCategoryId, dto.getCategoryId()))
                    .stream()
                    .map(Material::getId)
                    .toList();
            if (!materialIds.isEmpty()) {
                wrapper.in(MaterialStock::getMaterialId, materialIds);
            } else {
                wrapper.eq(MaterialStock::getId, -1);
            }
        }

        if (dto.getNeedSortByExpireDate() != null && dto.getNeedSortByExpireDate()) {
            wrapper.orderByAsc(MaterialStock::getExpireDate);
        } else if (dto.getSortBy() != null && !dto.getSortBy().isEmpty()) {
            boolean isAsc = dto.getSortOrder() == null || "asc".equalsIgnoreCase(dto.getSortOrder());
            switch (dto.getSortBy()) {
                case "availableQuantity" -> {
                    if (isAsc) {
                        wrapper.orderByAsc(MaterialStock::getAvailableQuantity);
                    } else {
                        wrapper.orderByDesc(MaterialStock::getAvailableQuantity);
                    }
                }
                case "expireDate" -> {
                    if (isAsc) {
                        wrapper.orderByAsc(MaterialStock::getExpireDate);
                    } else {
                        wrapper.orderByDesc(MaterialStock::getExpireDate);
                    }
                }
                case "totalAmount" -> {
                    if (isAsc) {
                        wrapper.orderByAsc(MaterialStock::getTotalAmount);
                    } else {
                        wrapper.orderByDesc(MaterialStock::getTotalAmount);
                    }
                }
                case "createTime" -> {
                    if (isAsc) {
                        wrapper.orderByAsc(MaterialStock::getCreateTime);
                    } else {
                        wrapper.orderByDesc(MaterialStock::getCreateTime);
                    }
                }
                default -> wrapper.orderByDesc(MaterialStock::getCreateTime);
            }
        } else {
            wrapper.orderByDesc(MaterialStock::getCreateTime);
        }

        IPage<MaterialStock> page = stockMapper.selectPage(dto.buildPage(), wrapper);
        return Result.success(page);
    }

    public Result<MaterialStock> getStockById(Long id) {
        MaterialStock stock = stockMapper.selectById(id);
        if (stock == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }
        return Result.success(stock);
    }

    public Result<Long> getWarningStockCount() {
        Long count = stockMapper.selectCount(new LambdaQueryWrapper<MaterialStock>()
                .eq(MaterialStock::getStockStatus, 2));
        return Result.success(count);
    }

    public Result<Long> getExpiringStockCount() {
        Long count = stockMapper.selectCount(new LambdaQueryWrapper<MaterialStock>()
                .eq(MaterialStock::getIsExpiring, 1));
        return Result.success(count);
    }

    public Result<Map<String, Object>> getBatchTraceability(String batchNo) {
        Map<String, Object> result = new HashMap<>();

        MaterialStock stock = stockMapper.selectOne(new LambdaQueryWrapper<MaterialStock>()
                .eq(MaterialStock::getBatchNo, batchNo));

        if (stock == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND, "批次号不存在");
        }

        result.put("stockInfo", stock);

        Material material = materialMapper.selectById(stock.getMaterialId());
        result.put("materialInfo", material);

        List<WorkOrderMaterial> orderMaterials = workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getBatchNo, batchNo));

        result.put("usedInWorkOrders", orderMaterials);

        List<Long> workOrderIds = orderMaterials.stream()
                .map(WorkOrderMaterial::getWorkOrderId)
                .distinct()
                .toList();

        if (!workOrderIds.isEmpty()) {
            List<WorkOrder> workOrders = workOrderMapper.selectList(
                    new LambdaQueryWrapper<WorkOrder>()
                            .in(WorkOrder::getId, workOrderIds));
            result.put("workOrders", workOrders);
        }

        return Result.success(result);
    }

    public Result<List<Map<String, Object>>> getStockSummary() {
        List<Map<String, Object>> result = new ArrayList<>();

        List<Material> materials = materialMapper.selectList(
                new LambdaQueryWrapper<Material>().eq(Material::getStatus, 1));

        for (Material material : materials) {
            List<MaterialStock> stocks = stockMapper.selectList(
                    new LambdaQueryWrapper<MaterialStock>()
                            .eq(MaterialStock::getMaterialId, material.getId())
                            .ne(MaterialStock::getStockStatus, 3));

            BigDecimal totalAvailable = stocks.stream()
                    .map(MaterialStock::getAvailableQuantity)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalValue = stocks.stream()
                    .map(s -> s.getAvailableQuantity().multiply(s.getUnitPrice() != null ? s.getUnitPrice() : BigDecimal.ZERO))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long warningCount = stocks.stream()
                    .filter(s -> s.getStockStatus() == 2)
                    .count();

            long expiringCount = stocks.stream()
                    .filter(s -> s.getIsExpiring() == 1)
                    .count();

            Map<String, Object> summary = new HashMap<>();
            summary.put("materialId", material.getId());
            summary.put("materialName", material.getName());
            summary.put("materialCode", material.getCode());
            summary.put("unit", material.getUnit());
            summary.put("totalAvailable", totalAvailable);
            summary.put("totalValue", totalValue);
            summary.put("warningStock", material.getWarningStock());
            summary.put("isWarning", totalAvailable.compareTo(material.getWarningStock() != null ? material.getWarningStock() : BigDecimal.ZERO) <= 0);
            summary.put("warningCount", warningCount);
            summary.put("expiringCount", expiringCount);
            summary.put("batchCount", stocks.size());

            result.add(summary);
        }

        return Result.success(result);
    }

    @Autowired
    private com.snack.processing.mapper.WorkOrderMaterialMapper workOrderMaterialMapper;

    @Autowired
    private com.snack.processing.mapper.WorkOrderMapper workOrderMapper;

    private String generateBatchNo(String materialCode) {
        String datePart = DateUtil.format(DateUtil.date(), "yyyyMMdd");
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return materialCode + "-" + datePart + "-" + uuid;
    }

    private void updateStockStatus(Long materialId) {
        Material material = materialMapper.selectById(materialId);
        if (material == null || material.getWarningStock() == null) {
            return;
        }

        BigDecimal totalAvailable = stockMapper.selectList(new LambdaQueryWrapper<MaterialStock>()
                        .eq(MaterialStock::getMaterialId, materialId)
                        .eq(MaterialStock::getStockStatus, 1))
                .stream()
                .map(MaterialStock::getAvailableQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<MaterialStock> stocks = stockMapper.selectList(new LambdaQueryWrapper<MaterialStock>()
                .eq(MaterialStock::getMaterialId, materialId)
                .ne(MaterialStock::getStockStatus, 3));

        for (MaterialStock stock : stocks) {
            if (totalAvailable.compareTo(material.getWarningStock()) <= 0) {
                if (stock.getStockStatus() == 1) {
                    stock.setStockStatus(2);
                    stockMapper.updateById(stock);
                }
            } else {
                if (stock.getStockStatus() == 2) {
                    stock.setStockStatus(1);
                    stockMapper.updateById(stock);
                }
            }
        }
    }
}
