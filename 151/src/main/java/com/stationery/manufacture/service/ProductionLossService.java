package com.stationery.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.BusinessException;
import com.stationery.manufacture.common.ErrorCode;
import com.stationery.manufacture.common.UserContext;
import com.stationery.manufacture.entity.MaterialStock;
import com.stationery.manufacture.entity.ProductionLoss;
import com.stationery.manufacture.mapper.MaterialStockMapper;
import com.stationery.manufacture.mapper.ProductionLossMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class ProductionLossService {

    private final ProductionLossMapper lossMapper;
    private final MaterialStockMapper stockMapper;
    private final StringRedisTemplate redisTemplate;

    public ProductionLossService(ProductionLossMapper lossMapper,
                                 MaterialStockMapper stockMapper,
                                 StringRedisTemplate redisTemplate) {
        this.lossMapper = lossMapper;
        this.stockMapper = stockMapper;
        this.redisTemplate = redisTemplate;
    }

    @Transactional(rollbackFor = Exception.class)
    public void recordLoss(ProductionLoss loss) {
        if (loss.getMaterialId() != null) {
            MaterialStock stock = stockMapper.selectById(loss.getMaterialId());
            if (stock != null) {
                loss.setMaterialCode(stock.getMaterialCode());
                loss.setMaterialName(stock.getMaterialName());
                loss.setUnit(stock.getUnit());
                if (loss.getUnitPrice() == null) {
                    loss.setUnitPrice(stock.getUnitPrice());
                }
            }
        }

        if (loss.getUnitPrice() != null && loss.getLossQuantity() != null) {
            loss.setLossAmount(loss.getLossQuantity().multiply(loss.getUnitPrice()));
        }

        loss.setLossNo(generateLossNo());
        loss.setOperatorId(UserContext.getCurrentUserId());
        loss.setOperatorName(UserContext.getCurrentUsername());
        loss.setCreateTime(LocalDateTime.now());
        loss.setUpdateTime(LocalDateTime.now());
        lossMapper.insert(loss);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateLoss(ProductionLoss loss) {
        ProductionLoss exist = lossMapper.selectById(loss.getId());
        if (exist == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        loss.setUpdateTime(LocalDateTime.now());
        if (loss.getUnitPrice() != null && loss.getLossQuantity() != null) {
            loss.setLossAmount(loss.getLossQuantity().multiply(loss.getUnitPrice()));
        }
        lossMapper.updateById(loss);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteLoss(Long id) {
        lossMapper.deleteById(id);
    }

    public ProductionLoss getLossById(Long id) {
        return lossMapper.selectById(id);
    }

    public Page<ProductionLoss> getLossPage(Integer pageNum, Integer pageSize,
                                            Long orderId, String lossType,
                                            Long materialId, LocalDateTime startTime,
                                            LocalDateTime endTime) {
        Page<ProductionLoss> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProductionLoss> wrapper = new LambdaQueryWrapper<>();

        if (orderId != null) {
            wrapper.eq(ProductionLoss::getOrderId, orderId);
        }
        if (StringUtils.hasText(lossType)) {
            wrapper.eq(ProductionLoss::getLossType, lossType);
        }
        if (materialId != null) {
            wrapper.eq(ProductionLoss::getMaterialId, materialId);
        }
        if (startTime != null) {
            wrapper.ge(ProductionLoss::getCreateTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(ProductionLoss::getCreateTime, endTime);
        }

        wrapper.orderByDesc(ProductionLoss::getCreateTime);
        return lossMapper.selectPage(page, wrapper);
    }

    public List<ProductionLoss> getLossByOrder(Long orderId) {
        return lossMapper.selectList(new LambdaQueryWrapper<ProductionLoss>()
                .eq(ProductionLoss::getOrderId, orderId)
                .orderByDesc(ProductionLoss::getCreateTime));
    }

    public List<Map<String, Object>> getLossStatistics(LocalDateTime startTime, LocalDateTime endTime) {
        return lossMapper.getLossStatistics(startTime, endTime);
    }

    private String generateLossNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String key = "loss:no:" + date;
        Long increment = redisTemplate.opsForValue().increment(key, 1);
        redisTemplate.expire(key, 1, TimeUnit.DAYS);
        return "LS" + date + String.format("%06d", increment);
    }
}
