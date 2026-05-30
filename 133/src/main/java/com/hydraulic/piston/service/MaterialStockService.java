package com.hydraulic.piston.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hydraulic.piston.common.StockStatusEnum;
import com.hydraulic.piston.dto.MaterialStockDTO;
import com.hydraulic.piston.entity.MaterialStock;
import com.hydraulic.piston.exception.BusinessException;
import com.hydraulic.piston.mapper.MaterialStockMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialStockService {

    private final MaterialStockMapper stockMapper;

    public Page<MaterialStock> getPage(Integer pageNum, Integer pageSize, String materialType, String materialName,
                                        String steelGrade, String specification, Integer stockStatus) {
        Page<MaterialStock> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<MaterialStock> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(materialType)) {
            wrapper.like(MaterialStock::getMaterialType, materialType);
        }
        if (StringUtils.hasText(materialName)) {
            wrapper.like(MaterialStock::getMaterialName, materialName);
        }
        if (StringUtils.hasText(steelGrade)) {
            wrapper.like(MaterialStock::getSteelGrade, steelGrade);
        }
        if (StringUtils.hasText(specification)) {
            wrapper.like(MaterialStock::getSpecification, specification);
        }
        if (stockStatus != null) {
            wrapper.eq(MaterialStock::getStockStatus, stockStatus);
        }
        wrapper.orderByDesc(MaterialStock::getCreateTime);

        return stockMapper.selectPage(page, wrapper);
    }

    public List<MaterialStock> getList(String materialType, String materialName, String steelGrade,
                                       String specification, Integer stockStatus) {
        LambdaQueryWrapper<MaterialStock> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(materialType)) {
            wrapper.like(MaterialStock::getMaterialType, materialType);
        }
        if (StringUtils.hasText(materialName)) {
            wrapper.like(MaterialStock::getMaterialName, materialName);
        }
        if (StringUtils.hasText(steelGrade)) {
            wrapper.like(MaterialStock::getSteelGrade, steelGrade);
        }
        if (StringUtils.hasText(specification)) {
            wrapper.like(MaterialStock::getSpecification, specification);
        }
        if (stockStatus != null) {
            wrapper.eq(MaterialStock::getStockStatus, stockStatus);
        }
        wrapper.orderByDesc(MaterialStock::getCreateTime);

        return stockMapper.selectList(wrapper);
    }

    public MaterialStock getById(Long id) {
        MaterialStock stock = stockMapper.selectById(id);
        if (stock == null) {
            throw new BusinessException("原料记录不存在");
        }
        return stock;
    }

    @Transactional(rollbackFor = Exception.class)
    public void inbound(MaterialStockDTO dto) {
        MaterialStock stock = new MaterialStock();
        BeanUtils.copyProperties(dto, stock);

        stock.setBatchNo(generateBatchNo(dto.getMaterialType()));

        if (!StringUtils.hasText(stock.getUnit())) {
            stock.setUnit("根");
        }
        if (stock.getInboundDate() == null) {
            stock.setInboundDate(LocalDate.now());
        }
        if (stock.getStockStatus() == null) {
            BigDecimal quantity = stock.getQuantity();
            if (quantity.compareTo(new BigDecimal("10")) >= 0) {
                stock.setStockStatus(StockStatusEnum.ADEQUATE.getCode());
            } else if (quantity.compareTo(BigDecimal.ZERO) > 0) {
                stock.setStockStatus(StockStatusEnum.WARNING.getCode());
            } else {
                stock.setStockStatus(StockStatusEnum.STOPPED.getCode());
            }
        }

        if (stock.getUnitPrice() != null) {
            stock.setTotalPrice(stock.getUnitPrice().multiply(stock.getQuantity()));
        }

        stockMapper.insert(stock);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(MaterialStockDTO dto) {
        MaterialStock exist = stockMapper.selectById(dto.getId());
        if (exist == null) {
            throw new BusinessException("原料记录不存在");
        }

        MaterialStock stock = new MaterialStock();
        BeanUtils.copyProperties(dto, stock);

        if (stock.getUnitPrice() != null && stock.getQuantity() != null) {
            stock.setTotalPrice(stock.getUnitPrice().multiply(stock.getQuantity()));
        }

        if (stock.getQuantity() != null) {
            BigDecimal quantity = stock.getQuantity();
            if (quantity.compareTo(new BigDecimal("10")) >= 0) {
                stock.setStockStatus(StockStatusEnum.ADEQUATE.getCode());
            } else if (quantity.compareTo(BigDecimal.ZERO) > 0) {
                stock.setStockStatus(StockStatusEnum.WARNING.getCode());
            } else {
                stock.setStockStatus(StockStatusEnum.STOPPED.getCode());
            }
        }

        stockMapper.updateById(stock);
    }

    @Transactional(rollbackFor = Exception.class)
    public void outbound(Long id, BigDecimal quantity, String remark) {
        MaterialStock stock = stockMapper.selectById(id);
        if (stock == null) {
            throw new BusinessException("原料记录不存在");
        }

        if (stock.getQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("库存不足");
        }

        BigDecimal remaining = stock.getQuantity().subtract(quantity);
        stock.setQuantity(remaining);

        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            stock.setStockStatus(StockStatusEnum.OUT_OF_STOCK.getCode());
        } else if (remaining.compareTo(new BigDecimal("10")) >= 0) {
            stock.setStockStatus(StockStatusEnum.ADEQUATE.getCode());
        } else {
            stock.setStockStatus(StockStatusEnum.WARNING.getCode());
        }

        if (stock.getUnitPrice() != null) {
            stock.setTotalPrice(stock.getUnitPrice().multiply(remaining));
        }

        stockMapper.updateById(stock);
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockStock(Long stockId, Long orderId, BigDecimal quantity) {
        MaterialStock stock = stockMapper.selectById(stockId);
        if (stock == null) {
            throw new BusinessException("原料记录不存在");
        }

        if (StockStatusEnum.LOCKED.getCode().equals(stock.getStockStatus())) {
            throw new BusinessException("该原料已被锁定，无法重复锁定");
        }
        if (StockStatusEnum.OUT_OF_STOCK.getCode().equals(stock.getStockStatus())) {
            throw new BusinessException("该原料已出库，无法锁定");
        }
        if (StockStatusEnum.STOPPED.getCode().equals(stock.getStockStatus())) {
            throw new BusinessException("该原料已停止采购，无法锁定");
        }

        if (stock.getQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("库存不足，无法锁定");
        }

        stock.setStockStatus(StockStatusEnum.LOCKED.getCode());
        stock.setLockedOrderId(orderId);
        stockMapper.updateById(stock);
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockStock(Long stockId) {
        MaterialStock stock = stockMapper.selectById(stockId);
        if (stock == null) {
            throw new BusinessException("原料记录不存在");
        }

        stock.setStockStatus(calculateStockStatus(stock.getQuantity()));
        stock.setLockedOrderId(null);
        stockMapper.updateById(stock);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        stockMapper.deleteById(id);
    }

    public List<MaterialStock> getWarningList() {
        return stockMapper.selectList(
                new LambdaQueryWrapper<MaterialStock>()
                        .in(MaterialStock::getStockStatus, StockStatusEnum.WARNING.getCode(), StockStatusEnum.LOCKED.getCode())
                        .orderByDesc(MaterialStock::getCreateTime)
        );
    }

    public List<MaterialStock> getExpiringList() {
        LocalDate warningDate = LocalDate.now().plusDays(30);
        return stockMapper.selectList(
                new LambdaQueryWrapper<MaterialStock>()
                        .le(MaterialStock::getExpiryDate, warningDate)
                        .gt(MaterialStock::getStockStatus, 0)
                        .orderByAsc(MaterialStock::getExpiryDate)
        );
    }

    private Integer calculateStockStatus(BigDecimal quantity) {
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            return StockStatusEnum.OUT_OF_STOCK.getCode();
        } else if (quantity.compareTo(new BigDecimal("10")) >= 0) {
            return StockStatusEnum.ADEQUATE.getCode();
        } else {
            return StockStatusEnum.WARNING.getCode();
        }
    }

    private String generateBatchNo(String materialType) {
        String typePrefix = materialType != null ? materialType.substring(0, Math.min(2, materialType.length())).toUpperCase() : "MT";
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int random = (int) (Math.random() * 1000);
        return typePrefix + dateStr + String.format("%03d", random);
    }
}