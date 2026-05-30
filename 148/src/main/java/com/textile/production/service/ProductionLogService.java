package com.textile.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textile.production.context.UserContext;
import com.textile.production.entity.ProductionLog;
import com.textile.production.mapper.ProductionLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionLogService extends ServiceImpl<ProductionLogMapper, ProductionLog> {

    public void log(Long orderId, Long processId, String operationType, String operationContent,
                    String beforeStatus, String afterStatus) {
        ProductionLog log = new ProductionLog();
        log.setOrderId(orderId);
        log.setProcessId(processId);
        log.setOperationType(operationType);
        log.setOperationContent(operationContent);
        log.setOperatorId(UserContext.getUserId());
        log.setOperatorName(UserContext.getUsername());
        log.setBeforeStatus(beforeStatus);
        log.setAfterStatus(afterStatus);
        save(log);
    }

    public List<ProductionLog> getLogsByOrderId(Long orderId) {
        LambdaQueryWrapper<ProductionLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionLog::getOrderId, orderId)
                .orderByDesc(ProductionLog::getCreateTime);
        return list(wrapper);
    }
}
