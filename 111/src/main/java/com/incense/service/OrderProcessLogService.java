package com.incense.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.incense.entity.OrderProcessLog;
import com.incense.mapper.OrderProcessLogMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderProcessLogService extends ServiceImpl<OrderProcessLogMapper, OrderProcessLog> {

    public List<OrderProcessLog> getByOrderId(Long orderId) {
        LambdaQueryWrapper<OrderProcessLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderProcessLog::getOrderId, orderId)
                .orderByAsc(OrderProcessLog::getOperationTime);
        return list(wrapper);
    }
}
