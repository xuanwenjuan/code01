package com.gear.mfg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gear.mfg.common.PageResult;
import com.gear.mfg.dto.MaterialStockQueryDTO;
import com.gear.mfg.entity.MaterialStock;
import com.gear.mfg.mapper.MaterialStockMapper;
import com.gear.mfg.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialStockService extends ServiceImpl<MaterialStockMapper, MaterialStock> {

    private final RedisUtil redisUtil;

    private static final String STOCK_CACHE_KEY = "gear:stock:";

    public PageResult<MaterialStock> queryByConditions(MaterialStockQueryDTO queryDTO) {
        Page<MaterialStock> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());

        LambdaQueryWrapper<MaterialStock> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getMaterialName())) {
            wrapper.like(MaterialStock::getMaterialName, queryDTO.getMaterialName());
        }

        if (StringUtils.hasText(queryDTO.getMaterialType())) {
            wrapper.eq(MaterialStock::getMaterialType, queryDTO.getMaterialType());
        }

        if (StringUtils.hasText(queryDTO.getBatchNo())) {
            wrapper.like(MaterialStock::getBatchNo, queryDTO.getBatchNo());
        }

        if (queryDTO.getStatus() != null) {
            wrapper.eq(MaterialStock::getStatus, queryDTO.getStatus());
        }

        if (queryDTO.getWarehouseId() != null) {
            wrapper.eq(MaterialStock::getWarehouseId, queryDTO.getWarehouseId());
        }

        if (queryDTO.getMinQuantity() != null) {
            wrapper.ge(MaterialStock::getQuantity, queryDTO.getMinQuantity());
        }

        if (queryDTO.getMaxQuantity() != null) {
            wrapper.le(MaterialStock::getQuantity, queryDTO.getMaxQuantity());
        }

        if (queryDTO.getStartInDate() != null) {
            wrapper.ge(MaterialStock::getInDate, queryDTO.getStartInDate());
        }

        if (queryDTO.getEndInDate() != null) {
            wrapper.le(MaterialStock::getInDate, queryDTO.getEndInDate());
        }

        if (Boolean.TRUE.equals(queryDTO.getRustProofWarning())) {
            LocalDateTime warningDate = LocalDateTime.now().minusDays(90);
            wrapper.le(MaterialStock::getInDate, warningDate);
        }

        wrapper.orderByDesc(MaterialStock::getCreateTime);

        Page<MaterialStock> result = page(page, wrapper);

        return new PageResult<>(result.getRecords(), result.getTotal(), queryDTO.getPageNum(), queryDTO.getPageSize());
    }

    @Cacheable(value = "stock", key = "#id", unless = "#result == null")
    public MaterialStock getStockById(Long id) {
        return getById(id);
    }

    public boolean lockStock(Long id, BigDecimal quantity) {
        MaterialStock stock = getById(id);
        if (stock == null || stock.getQuantity().compareTo(quantity) < 0) {
            return false;
        }

        stock.setQuantity(stock.getQuantity().subtract(quantity));
        stock.setLockedQuantity(stock.getLockedQuantity() == null ? quantity : stock.getLockedQuantity().add(quantity));
        return updateById(stock);
    }

    public boolean unlockStock(Long id, BigDecimal quantity) {
        MaterialStock stock = getById(id);
        if (stock == null || (stock.getLockedQuantity() != null && stock.getLockedQuantity().compareTo(quantity) < 0)) {
            return false;
        }

        stock.setQuantity(stock.getQuantity().add(quantity));
        stock.setLockedQuantity(stock.getLockedQuantity().subtract(quantity));
        return updateById(stock);
    }

    public boolean deductLockedStock(Long id, BigDecimal quantity) {
        MaterialStock stock = getById(id);
        if (stock == null || (stock.getLockedQuantity() != null && stock.getLockedQuantity().compareTo(quantity) < 0)) {
            return false;
        }

        stock.setLockedQuantity(stock.getLockedQuantity().subtract(quantity));
        return updateById(stock);
    }

    public List<MaterialStock> getAvailableStock(String materialType, BigDecimal minQuantity) {
        LambdaQueryWrapper<MaterialStock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStock::getMaterialType, materialType)
                .ge(MaterialStock::getQuantity, minQuantity)
                .orderByAsc(MaterialStock::getInDate);

        return list(wrapper);
    }
}
