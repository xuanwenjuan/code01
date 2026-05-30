package com.stationery.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.BusinessException;
import com.stationery.manufacture.common.ErrorCode;
import com.stationery.manufacture.dto.MaterialQueryDTO;
import com.stationery.manufacture.entity.MaterialStock;
import com.stationery.manufacture.mapper.MaterialStockMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class MaterialStockService {

    private final MaterialStockMapper stockMapper;
    private final StringRedisTemplate redisTemplate;

    public MaterialStockService(MaterialStockMapper stockMapper, StringRedisTemplate redisTemplate) {
        this.stockMapper = stockMapper;
        this.redisTemplate = redisTemplate;
    }

    @Transactional(rollbackFor = Exception.class)
    public void addStock(MaterialStock stock) {
        stock.setBatchNo(generateBatchNo(stock.getMaterialType()));
        stock.setCreateTime(LocalDateTime.now());
        stock.setUpdateTime(LocalDateTime.now());

        if (stock.getStockStatus() == null) {
            stock.setStockStatus(1);
        }
        if (stock.getPurchaseStatus() == null) {
            stock.setPurchaseStatus(1);
        }
        if (stock.getMoistureProof() == null) {
            stock.setMoistureProof(0);
        }

        updateStockStatus(stock);
        stockMapper.insert(stock);

        if (stock.getMoistureProof() == 1) {
            setMoistureReminder(stock);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStock(MaterialStock stock) {
        MaterialStock exist = stockMapper.selectById(stock.getId());
        if (exist == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }

        stock.setUpdateTime(LocalDateTime.now());
        updateStockStatus(stock);
        stockMapper.updateById(stock);

        if (stock.getMoistureProof() != null && stock.getMoistureProof() == 1) {
            setMoistureReminder(stock);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteStock(Long id) {
        stockMapper.deleteById(id);
    }

    public MaterialStock getStockById(Long id) {
        return stockMapper.selectById(id);
    }

    public Page<MaterialStock> getStockPage(Integer pageNum, Integer pageSize,
                                            String materialType, String materialName,
                                            Integer stockStatus, Integer purchaseStatus) {
        Page<MaterialStock> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<MaterialStock> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(materialType)) {
            wrapper.eq(MaterialStock::getMaterialType, materialType);
        }
        if (StringUtils.hasText(materialName)) {
            wrapper.like(MaterialStock::getMaterialName, materialName);
        }
        if (stockStatus != null) {
            wrapper.eq(MaterialStock::getStockStatus, stockStatus);
        }
        if (purchaseStatus != null) {
            wrapper.eq(MaterialStock::getPurchaseStatus, purchaseStatus);
        }

        wrapper.orderByDesc(MaterialStock::getCreateTime);
        return stockMapper.selectPage(page, wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStockQuantity(Long id, BigDecimal quantity, String type) {
        MaterialStock stock = stockMapper.selectById(id);
        if (stock == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }

        BigDecimal newQuantity;
        if ("IN".equals(type)) {
            newQuantity = stock.getQuantity().add(quantity);
        } else if ("OUT".equals(type)) {
            if (stock.getQuantity().compareTo(quantity) < 0) {
                throw new BusinessException(ErrorCode.STOCK_NOT_ENOUGH);
            }
            newQuantity = stock.getQuantity().subtract(quantity);
        } else {
            throw new BusinessException("操作类型错误");
        }

        stock.setQuantity(newQuantity);
        updateStockStatus(stock);
        stock.setUpdateTime(LocalDateTime.now());
        stockMapper.updateById(stock);
    }

    private void updateStockStatus(MaterialStock stock) {
        if (stock.getQuantity() != null && stock.getWarningQuantity() != null) {
            if (stock.getQuantity().compareTo(stock.getWarningQuantity()) <= 0) {
                stock.setStockStatus(2);
                stock.setPurchaseStatus(2);
            } else {
                stock.setStockStatus(1);
            }
        }
    }

    private String generateBatchNo(String materialType) {
        String prefix = materialType != null ? materialType.substring(0, 2).toUpperCase() : "MT";
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String key = "batch:no:" + prefix + date;
        Long increment = redisTemplate.opsForValue().increment(key, 1);
        redisTemplate.expire(key, 1, TimeUnit.DAYS);
        return prefix + date + String.format("%04d", increment);
    }

    private void setMoistureReminder(MaterialStock stock) {
        String key = "moisture:reminder:" + stock.getId();
        redisTemplate.opsForValue().set(key, stock.getMaterialName() + " 需要防潮存储提醒", 30, TimeUnit.DAYS);
    }

    public List<MaterialStock> getWarningList() {
        return stockMapper.selectList(new LambdaQueryWrapper<MaterialStock>()
                .eq(MaterialStock::getStockStatus, 2)
                .orderByDesc(MaterialStock::getCreateTime));
    }

    public List<MaterialStock> getMoistureList() {
        return stockMapper.selectList(new LambdaQueryWrapper<MaterialStock>()
                .eq(MaterialStock::getMoistureProof, 1)
                .orderByDesc(MaterialStock::getCreateTime));
    }

    @Transactional(rollbackFor = Exception.class)
    public void updatePurchaseStatus(Long id, Integer status) {
        stockMapper.update(null, new LambdaUpdateWrapper<MaterialStock>()
                .eq(MaterialStock::getId, id)
                .set(MaterialStock::getPurchaseStatus, status)
                .set(MaterialStock::getUpdateTime, LocalDateTime.now()));
    }

    public Page<MaterialStock> queryMaterials(MaterialQueryDTO dto) {
        Page<MaterialStock> page = new Page<>(dto.getPageNum(), dto.getPageSize());
        LambdaQueryWrapper<MaterialStock> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(dto.getMaterialCode())) {
            wrapper.like(MaterialStock::getMaterialCode, dto.getMaterialCode());
        }
        if (StringUtils.hasText(dto.getMaterialName())) {
            wrapper.like(MaterialStock::getMaterialName, dto.getMaterialName());
        }
        if (StringUtils.hasText(dto.getMaterialType())) {
            wrapper.eq(MaterialStock::getMaterialType, dto.getMaterialType());
        }
        if (StringUtils.hasText(dto.getBatchNo())) {
            wrapper.like(MaterialStock::getBatchNo, dto.getBatchNo());
        }
        if (StringUtils.hasText(dto.getSupplier())) {
            wrapper.like(MaterialStock::getSupplier, dto.getSupplier());
        }
        if (dto.getStockStatus() != null) {
            wrapper.eq(MaterialStock::getStockStatus, dto.getStockStatus());
        }
        if (dto.getPurchaseStatus() != null) {
            wrapper.eq(MaterialStock::getPurchaseStatus, dto.getPurchaseStatus());
        }
        if (dto.getMoistureProof() != null) {
            wrapper.eq(MaterialStock::getMoistureProof, dto.getMoistureProof());
        }
        if (dto.getMinQuantity() != null) {
            wrapper.ge(MaterialStock::getQuantity, dto.getMinQuantity());
        }
        if (dto.getMaxQuantity() != null) {
            wrapper.le(MaterialStock::getQuantity, dto.getMaxQuantity());
        }
        if (dto.getMinUnitPrice() != null) {
            wrapper.ge(MaterialStock::getUnitPrice, dto.getMinUnitPrice());
        }
        if (dto.getMaxUnitPrice() != null) {
            wrapper.le(MaterialStock::getUnitPrice, dto.getMaxUnitPrice());
        }
        if (StringUtils.hasText(dto.getStorageLocation())) {
            wrapper.like(MaterialStock::getStorageLocation, dto.getStorageLocation());
        }
        if (dto.getStartTime() != null) {
            wrapper.ge(MaterialStock::getCreateTime, dto.getStartTime());
        }
        if (dto.getEndTime() != null) {
            wrapper.le(MaterialStock::getCreateTime, dto.getEndTime());
        }

        if (StringUtils.hasText(dto.getSortField())) {
            boolean isAsc = "asc".equalsIgnoreCase(dto.getSortOrder());
            switch (dto.getSortField()) {
                case "quantity":
                    wrapper.orderBy(true, isAsc, MaterialStock::getQuantity);
                    break;
                case "unitPrice":
                    wrapper.orderBy(true, isAsc, MaterialStock::getUnitPrice);
                    break;
                case "createTime":
                    wrapper.orderBy(true, isAsc, MaterialStock::getCreateTime);
                    break;
                case "updateTime":
                    wrapper.orderBy(true, isAsc, MaterialStock::getUpdateTime);
                    break;
                default:
                    wrapper.orderByDesc(MaterialStock::getCreateTime);
            }
        } else {
            wrapper.orderByDesc(MaterialStock::getCreateTime);
        }

        return stockMapper.selectPage(page, wrapper);
    }
}
