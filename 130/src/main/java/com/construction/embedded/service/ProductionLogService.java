package com.construction.embedded.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.construction.embedded.entity.ProductionLog;
import com.construction.embedded.mapper.ProductionLogMapper;
import com.construction.embedded.util.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProductionLogService {

    @Autowired
    private ProductionLogMapper productionLogMapper;

    public void saveLog(Long orderId, String operationType, String content, String beforeStatus, String afterStatus) {
        ProductionLog log = new ProductionLog();
        log.setOrderId(orderId);
        log.setOperationType(operationType);
        log.setOperationContent(content);
        log.setBeforeStatus(beforeStatus);
        log.setAfterStatus(afterStatus);
        log.setOperatorId(UserContext.getUserId());
        log.setOperatorName(UserContext.getUsername());
        productionLogMapper.insert(log);
    }

    public IPage<ProductionLog> queryPage(Long orderId, String operationType, Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<ProductionLog> wrapper = new LambdaQueryWrapper<>();
        if (orderId != null) {
            wrapper.eq(ProductionLog::getOrderId, orderId);
        }
        if (operationType != null && !operationType.isEmpty()) {
            wrapper.eq(ProductionLog::getOperationType, operationType);
        }
        wrapper.orderByDesc(ProductionLog::getOperationTime);
        return productionLogMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    public ProductionLog getById(Long id) {
        return productionLogMapper.selectById(id);
    }
}
