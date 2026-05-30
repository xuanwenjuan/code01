package com.aluminum.extrusion.service;

import com.alibaba.fastjson2.JSON;
import com.aluminum.extrusion.dto.StockQueryDTO;
import com.aluminum.extrusion.entity.AluminumStock;
import com.aluminum.extrusion.enums.StockStatusEnum;
import com.aluminum.extrusion.exception.BusinessException;
import com.aluminum.extrusion.mapper.AluminumStockMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AluminumStockService extends ServiceImpl<AluminumStockMapper, AluminumStock> {

    private final StringRedisTemplate redisTemplate;
    private final OperationLogService operationLogService;

    private static final String STOCK_CACHE_KEY = "extrusion:stock:list";
    private static final String STOCK_LOCK_KEY = "extrusion:stock:lock:";
    private static final long CACHE_EXPIRE_HOURS = 1;

    @Transactional(rollbackFor = Exception.class)
    public void addStock(AluminumStock stock) {
        String batchNo = generateBatchNo(stock.getMaterialType());
        stock.setBatchNo(batchNo);
        stock.setLockedQuantity(BigDecimal.ZERO);

        updateStockStatus(stock);

        if (stock.getStorageLocation() != null && stock.getStorageLocation().contains("露天")) {
            LocalDate oxidationDate = stock.getProductionDate() != null ?
                    stock.getProductionDate().plusDays(30) : LocalDate.now().plusDays(30);
            stock.setOxidationWarningDate(oxidationDate);
        }

        save(stock);
        clearStockCache();

        operationLogService.log("原料入库", "批次号: " + batchNo +
                ", 合金牌号: " + stock.getAlloyGrade() +
                ", 入库数量: " + stock.getQuantity());
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStock(AluminumStock stock) {
        AluminumStock existing = getById(stock.getId());
        if (existing == null) {
            throw new BusinessException("库存记录不存在");
        }

        updateStockStatus(stock);

        if (stock.getStorageLocation() != null && stock.getStorageLocation().contains("露天")) {
            LocalDate productionDate = stock.getProductionDate() != null ?
                    stock.getProductionDate() : existing.getProductionDate();
            if (productionDate != null) {
                stock.setOxidationWarningDate(productionDate.plusDays(30));
            }
        }

        updateById(stock);
        clearStockCache();

        operationLogService.log("库存更新", "批次号: " + existing.getBatchNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStockQuantity(Long id, BigDecimal quantity, Integer type, String remark) {
        AluminumStock stock = getById(id);
        if (stock == null) {
            throw new BusinessException("库存记录不存在");
        }

        if (type == 1) {
            stock.setQuantity(stock.getQuantity().add(quantity));
            operationLogService.log("原料入库", "批次号: " + stock.getBatchNo() + ", 入库数量: " + quantity);
        } else {
            BigDecimal availableQuantity = stock.getQuantity().subtract(stock.getLockedQuantity());
            if (availableQuantity.compareTo(quantity) < 0) {
                throw new BusinessException("可用库存不足，可用数量: " + availableQuantity);
            }
            stock.setQuantity(stock.getQuantity().subtract(quantity));
            operationLogService.log("原料出库", "批次号: " + stock.getBatchNo() + ", 出库数量: " + quantity);
        }

        updateStockStatus(stock);
        updateById(stock);
        clearStockCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockStock(Long stockId, BigDecimal quantity, String orderNo) {
        AluminumStock stock = getById(stockId);
        if (stock == null) {
            throw new BusinessException("库存记录不存在");
        }

        BigDecimal availableQuantity = stock.getQuantity().subtract(stock.getLockedQuantity());
        if (availableQuantity.compareTo(quantity) < 0) {
            throw new BusinessException("可用库存不足，可用数量: " + availableQuantity);
        }

        stock.setLockedQuantity(stock.getLockedQuantity().add(quantity));
        updateById(stock);
        clearStockCache();

        String lockKey = STOCK_LOCK_KEY + orderNo;
        redisTemplate.opsForValue().set(lockKey, stockId + ":" + quantity, 24, TimeUnit.HOURS);

        operationLogService.log("库存锁定", "工单号: " + orderNo +
                ", 批次号: " + stock.getBatchNo() +
                ", 锁定数量: " + quantity);
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockStock(String orderNo) {
        String lockKey = STOCK_LOCK_KEY + orderNo;
        String lockValue = redisTemplate.opsForValue().get(lockKey);
        if (lockValue == null) {
            return;
        }

        String[] parts = lockValue.split(":");
        Long stockId = Long.parseLong(parts[0]);
        BigDecimal quantity = new BigDecimal(parts[1]);

        AluminumStock stock = getById(stockId);
        if (stock != null) {
            stock.setLockedQuantity(stock.getLockedQuantity().subtract(quantity));
            updateById(stock);
            clearStockCache();

            operationLogService.log("库存解锁", "工单号: " + orderNo + ", 解锁数量: " + quantity);
        }

        redisTemplate.delete(lockKey);
    }

    @Transactional(rollbackFor = Exception.class)
    public void consumeStock(Long stockId, BigDecimal quantity, BigDecimal scrapQuantity, String orderNo) {
        AluminumStock stock = getById(stockId);
        if (stock == null) {
            throw new BusinessException("库存记录不存在");
        }

        stock.setLockedQuantity(stock.getLockedQuantity().subtract(quantity));
        stock.setQuantity(stock.getQuantity().subtract(quantity));
        updateStockStatus(stock);
        updateById(stock);
        clearStockCache();

        operationLogService.log("原料消耗", "工单号: " + orderNo +
                ", 批次号: " + stock.getBatchNo() +
                ", 消耗数量: " + quantity +
                ", 报废数量: " + scrapQuantity);
    }

    private void updateStockStatus(AluminumStock stock) {
        if (stock.getQuantity() == null) {
            stock.setQuantity(BigDecimal.ZERO);
        }

        BigDecimal availableQuantity = stock.getQuantity().subtract(
                stock.getLockedQuantity() != null ? stock.getLockedQuantity() : BigDecimal.ZERO);

        if (availableQuantity.compareTo(stock.getWarningQuantity()) >= 0) {
            stock.setStockStatus(StockStatusEnum.SUFFICIENT.getCode());
        } else if (availableQuantity.compareTo(BigDecimal.ZERO) > 0) {
            stock.setStockStatus(StockStatusEnum.WARNING.getCode());
        } else {
            stock.setStockStatus(StockStatusEnum.STOP_PURCHASE.getCode());
        }
    }

    private String generateBatchNo(Integer materialType) {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "MAT" + materialType;

        LambdaQueryWrapper<AluminumStock> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(AluminumStock::getBatchNo, prefix + dateStr);
        wrapper.orderByDesc(AluminumStock::getBatchNo);
        wrapper.last("limit 1");

        AluminumStock lastStock = getOne(wrapper);
        int sequence = 1;
        if (lastStock != null && lastStock.getBatchNo() != null) {
            String lastSeq = lastStock.getBatchNo().substring(lastStock.getBatchNo().length() - 3);
            sequence = Integer.parseInt(lastSeq) + 1;
        }

        return String.format("%s%s%03d", prefix, dateStr, sequence);
    }

    public List<AluminumStock> getWarningList() {
        LambdaQueryWrapper<AluminumStock> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w.eq(AluminumStock::getStockStatus, StockStatusEnum.WARNING.getCode())
                        .or()
                        .lt(AluminumStock::getOxidationWarningDate, LocalDate.now().plusDays(7)))
                .orderByAsc(AluminumStock::getOxidationWarningDate);
        return list(wrapper);
    }

    public IPage<AluminumStock> getStockPage(StockQueryDTO queryDTO) {
        LambdaQueryWrapper<AluminumStock> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getMaterialType() != null) {
            wrapper.eq(AluminumStock::getMaterialType, queryDTO.getMaterialType());
        }
        if (queryDTO.getStockStatus() != null) {
            wrapper.eq(AluminumStock::getStockStatus, queryDTO.getStockStatus());
        }
        if (StringUtils.hasText(queryDTO.getAlloyGrade())) {
            wrapper.like(AluminumStock::getAlloyGrade, queryDTO.getAlloyGrade());
        }
        if (StringUtils.hasText(queryDTO.getSpecification())) {
            wrapper.like(AluminumStock::getSpecification, queryDTO.getSpecification());
        }
        if (StringUtils.hasText(queryDTO.getBatchNo())) {
            wrapper.like(AluminumStock::getBatchNo, queryDTO.getBatchNo());
        }
        if (StringUtils.hasText(queryDTO.getStorageLocation())) {
            wrapper.like(AluminumStock::getStorageLocation, queryDTO.getStorageLocation());
        }

        wrapper.orderByDesc(AluminumStock::getCreateTime);
        return page(new Page<>(queryDTO.getCurrent(), queryDTO.getSize()), wrapper);
    }

    public List<AluminumStock> getAllStockList() {
        String cache = redisTemplate.opsForValue().get(STOCK_CACHE_KEY);
        if (cache != null) {
            return JSON.parseArray(cache, AluminumStock.class);
        }

        LambdaQueryWrapper<AluminumStock> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(AluminumStock::getCreateTime);
        List<AluminumStock> list = list(wrapper);

        redisTemplate.opsForValue().set(STOCK_CACHE_KEY, JSON.toJSONString(list),
                CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
        return list;
    }

    public List<AluminumStock> getAvailableStockList(String alloyGrade) {
        LambdaQueryWrapper<AluminumStock> wrapper = new LambdaQueryWrapper<>();
        wrapper.gt(AluminumStock::getQuantity, 0);
        wrapper.apply("quantity - locked_quantity > 0");

        if (StringUtils.hasText(alloyGrade)) {
            wrapper.eq(AluminumStock::getAlloyGrade, alloyGrade);
        }

        wrapper.orderByDesc(AluminumStock::getCreateTime);
        return list(wrapper);
    }

    private void clearStockCache() {
        redisTemplate.delete(STOCK_CACHE_KEY);
    }
}
