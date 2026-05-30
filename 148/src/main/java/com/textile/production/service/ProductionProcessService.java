package com.textile.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textile.production.common.Result;
import com.textile.production.entity.ProductionProcess;
import com.textile.production.mapper.ProductionProcessMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionProcessService extends ServiceImpl<ProductionProcessMapper, ProductionProcess> {

    public Result<List<ProductionProcess>> getProcessesByOrderId(Long orderId) {
        LambdaQueryWrapper<ProductionProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionProcess::getOrderId, orderId)
                .orderByAsc(ProductionProcess::getProcessIndex);
        return Result.success(list(wrapper));
    }
}
