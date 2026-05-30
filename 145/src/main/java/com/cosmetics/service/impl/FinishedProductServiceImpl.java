package com.cosmetics.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.common.PageQuery;
import com.cosmetics.common.ResultCode;
import com.cosmetics.context.UserContext;
import com.cosmetics.entity.*;
import com.cosmetics.exception.BusinessException;
import com.cosmetics.mapper.*;
import com.cosmetics.service.FinishedProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FinishedProductServiceImpl implements FinishedProductService {

    private final FinishedProductMapper finishedProductMapper;
    private final FinishedInOutLogMapper inOutLogMapper;
    private final ProductMapper productMapper;
    private final UserMapper userMapper;

    @Override
    public Page<FinishedProduct> getPage(PageQuery pageQuery, Long productId, Integer status) {
        LambdaQueryWrapper<FinishedProduct> wrapper = new LambdaQueryWrapper<>();
        if (productId != null) {
            wrapper.eq(FinishedProduct::getProductId, productId);
        }
        if (status != null) {
            wrapper.eq(FinishedProduct::getStatus, status);
        }
        wrapper.orderByDesc(FinishedProduct::getCreateTime);

        return finishedProductMapper.selectPage(
                new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()),
                wrapper
        );
    }

    @Override
    public FinishedProduct getById(Long id) {
        return finishedProductMapper.selectById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void warehouseIn(FinishedProduct finishedProduct) {
        Product product = productMapper.selectById(finishedProduct.getProductId());
        if (product == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND.getCode(), "产品不存在");
        }

        if (finishedProduct.getBatchNo() == null || finishedProduct.getBatchNo().isEmpty()) {
            finishedProduct.setBatchNo(generateBatchNo());
        }
        finishedProduct.setRemainingQuantity(finishedProduct.getQuantity());
        finishedProduct.setWarehouseTime(LocalDateTime.now());
        finishedProduct.setOperatorId(UserContext.getUserId());
        finishedProduct.setStatus(1);

        finishedProductMapper.insert(finishedProduct);

        saveInOutLog(finishedProduct.getId(), 1, finishedProduct.getQuantity(),
                BigDecimal.ZERO, finishedProduct.getQuantity(), null, "成品入库");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void warehouseOut(Long id, BigDecimal quantity, String orderNo, String remark) {
        FinishedProduct finishedProduct = finishedProductMapper.selectById(id);
        if (finishedProduct == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND.getCode(), "成品库存不存在");
        }
        if (finishedProduct.getRemainingQuantity().compareTo(quantity) < 0) {
            throw new BusinessException(ResultCode.INVENTORY_SHORTAGE);
        }

        BigDecimal beforeQuantity = finishedProduct.getRemainingQuantity();
        finishedProduct.setRemainingQuantity(finishedProduct.getRemainingQuantity().subtract(quantity));
        if (finishedProduct.getRemainingQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            finishedProduct.setStatus(2);
        }
        finishedProductMapper.updateById(finishedProduct);

        saveInOutLog(id, 2, quantity, beforeQuantity, finishedProduct.getRemainingQuantity(), orderNo, remark);
    }

    @Override
    public BigDecimal getTotalStock(Long productId) {
        return finishedProductMapper.selectList(
                        new LambdaQueryWrapper<FinishedProduct>()
                                .eq(FinishedProduct::getProductId, productId)
                                .eq(FinishedProduct::getStatus, 1)
                ).stream()
                .map(FinishedProduct::getRemainingQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public Map<String, Object> getStockSummary() {
        Map<String, Object> summary = new HashMap<>();

        Long totalProducts = productMapper.selectCount(new LambdaQueryWrapper<Product>().eq(Product::getStatus, 1));
        Long totalBatches = finishedProductMapper.selectCount(new LambdaQueryWrapper<>());
        Long inStockBatches = finishedProductMapper.selectCount(
                new LambdaQueryWrapper<FinishedProduct>().eq(FinishedProduct::getStatus, 1)
        );

        BigDecimal totalStockValue = BigDecimal.ZERO;
        List<FinishedProduct> allStock = finishedProductMapper.selectList(
                new LambdaQueryWrapper<FinishedProduct>().eq(FinishedProduct::getStatus, 1)
        );

        summary.put("totalProducts", totalProducts);
        summary.put("totalBatches", totalBatches);
        summary.put("inStockBatches", inStockBatches);

        return summary;
    }

    @Override
    public Page<FinishedInOutLog> getInOutLogPage(PageQuery pageQuery, Long finishedProductId, Integer type) {
        LambdaQueryWrapper<FinishedInOutLog> wrapper = new LambdaQueryWrapper<>();
        if (finishedProductId != null) {
            wrapper.eq(FinishedInOutLog::getFinishedProductId, finishedProductId);
        }
        if (type != null) {
            wrapper.eq(FinishedInOutLog::getType, type);
        }
        wrapper.orderByDesc(FinishedInOutLog::getCreateTime);

        return inOutLogMapper.selectPage(
                new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()),
                wrapper
        );
    }

    @Override
    public List<FinishedProduct> getAvailableStock(Long productId) {
        return finishedProductMapper.selectList(
                new LambdaQueryWrapper<FinishedProduct>()
                        .eq(FinishedProduct::getProductId, productId)
                        .eq(FinishedProduct::getStatus, 1)
                        .gt(FinishedProduct::getRemainingQuantity, BigDecimal.ZERO)
                        .orderByAsc(FinishedProduct::getProductionDate)
        );
    }

    private String generateBatchNo() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "FP" + dateStr;

        Long count = finishedProductMapper.selectCount(
                new LambdaQueryWrapper<FinishedProduct>()
                        .likeRight(FinishedProduct::getBatchNo, prefix)
        );

        return String.format("%s%04d", prefix, count + 1);
    }

    private void saveInOutLog(Long finishedProductId, Integer type, BigDecimal quantity,
                              BigDecimal beforeQuantity, BigDecimal afterQuantity, String orderNo, String remark) {
        FinishedInOutLog log = new FinishedInOutLog();
        log.setFinishedProductId(finishedProductId);
        log.setType(type);
        log.setQuantity(quantity);
        log.setBeforeQuantity(beforeQuantity);
        log.setAfterQuantity(afterQuantity);
        log.setOrderNo(orderNo);
        log.setOperatorId(UserContext.getUserId());

        User user = userMapper.selectById(UserContext.getUserId());
        if (user != null) {
            log.setOperatorName(user.getRealName());
        }
        log.setRemark(remark);
        inOutLogMapper.insert(log);
    }
}
