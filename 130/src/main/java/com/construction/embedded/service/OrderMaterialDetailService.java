package com.construction.embedded.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.construction.embedded.entity.OrderMaterialDetail;
import com.construction.embedded.mapper.OrderMaterialDetailMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderMaterialDetailService {

    @Autowired
    private OrderMaterialDetailMapper orderMaterialDetailMapper;

    public List<OrderMaterialDetail> getByOrderId(Long orderId) {
        LambdaQueryWrapper<OrderMaterialDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderMaterialDetail::getOrderId, orderId);
        return orderMaterialDetailMapper.selectList(wrapper);
    }

    @Transactional
    public void addDetail(OrderMaterialDetail detail) {
        if (detail.getUsedQuantity() != null && detail.getUnitPrice() != null) {
            detail.setTotalPrice(detail.getUsedQuantity().multiply(detail.getUnitPrice()));
        }
        orderMaterialDetailMapper.insert(detail);
    }

    @Transactional
    public void updateDetail(OrderMaterialDetail detail) {
        if (detail.getUsedQuantity() != null && detail.getUnitPrice() != null) {
            detail.setTotalPrice(detail.getUsedQuantity().multiply(detail.getUnitPrice()));
        }
        orderMaterialDetailMapper.updateById(detail);
    }

    @Transactional
    public void deleteDetail(Long id) {
        orderMaterialDetailMapper.deleteById(id);
    }
}
