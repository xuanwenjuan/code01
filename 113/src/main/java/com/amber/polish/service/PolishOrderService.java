package com.amber.polish.service;

import com.amber.polish.dto.OrderCompleteDTO;
import com.amber.polish.dto.PolishOrderDTO;
import com.amber.polish.entity.PolishOrder;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;

import java.math.BigDecimal;
import java.util.Map;

public interface PolishOrderService extends IService<PolishOrder> {

    Page<PolishOrder> getOrderPage(int pageNum, int pageSize, String status, Long polisherId);

    boolean confirmDesign(Long orderId, Long operatorId);

    Map<String, BigDecimal> completeOrderAndCalculateCost(OrderCompleteDTO dto, Long operatorId);

    boolean createOrder(PolishOrderDTO dto);

    boolean createOrder(PolishOrder polishOrder);

    boolean updateOrderStatus(Long id, String status, Long operatorId);

    boolean updateOrderStatus(Long id, String status);

    void shelveOverdueOrders();
}
